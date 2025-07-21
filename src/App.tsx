import React, { useEffect, useRef, useState } from "react";
import { FaPen } from "react-icons/fa";
import { IoClose, IoFolderOpenOutline } from "react-icons/io5";
import { MdKeyboardBackspace } from "react-icons/md";
import { TiDeleteOutline } from "react-icons/ti";
import { localization } from "./localization";
import ExtPay from "extpay";
import {
  TbFolderStar,
  TbFolderUp,
  TbFolderX,
  TbReportMoney,
} from "react-icons/tb";
import {
  closestCenter,
  DndContext,
  MouseSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

window.addEventListener(
  "dragover",
  function (e) {
    e.preventDefault();
  },
  false
);
window.addEventListener(
  "drop",
  function (e) {
    e.preventDefault();
  },
  false
);

type workspaceType = {
  settings: "keepAll" | "keepCurrent" | "keepNone";
  name: string;
  urls: string[];
  id: UniqueIdentifier;
};

type workspacesType = workspaceType[];

type langType = {
  addWorkspacePlaceholder: string;
  addLinkPlaceholder: string;
  advice: {
    heading: string;
    texts: {
      letter: string;
      text: string;
    }[];
  };
  buttons: {
    buy: string;
    login: string;
    addWorkspaceEmpty: string;
    addWorkspaceTabs: string;
    addWorkspaceCancel: string;
  };
  texts: {
    first: string;
    second: string;
  };
  subscription: string;
};

function Workspace({
  texts,
  workspaces,
  workspace,
  setWorkspaces,
}: {
  texts: langType;
  workspaces: workspaceType[];
  workspace: workspaceType;
  setWorkspaces: React.Dispatch<React.SetStateAction<workspacesType>>;
}) {
  const [toggle, setToggle] = useState<boolean>(false);
  const [urls, setUrls] = useState<string[]>(workspace.urls);
  const [dragover, setDragover] = useState<boolean>(false);
  const [toggleDelete, setToggleDelete] = useState<boolean>(false);
  const [settings, setSettings] = useState<
    "keepAll" | "keepCurrent" | "keepNone"
  >(workspace.settings);
  const [link, setLink] = useState<string>("");
  const [changeNameToggle, setChangeNameToggle] = useState<boolean>(false);
  const [workspaceName, setWorkspaceName] = useState<string>(workspace.name);
  const { attributes, listeners, transform, transition, setNodeRef } =
    useSortable({ id: workspace.id });

  const toggleWorkspaceNameInput = useRef<HTMLInputElement | null>(null);

  function handleClickOutside(e: MouseEvent) {
    if (
      toggleWorkspaceNameInput.current &&
      !toggleWorkspaceNameInput.current.contains(e.target as Node)
    ) {
      setChangeNameToggle(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function deleteUrl(item: string) {
    const newArray = urls.filter((url) => item != url);
    setUrls([...newArray]);
  }

  function addUrl(url: string) {
    if (!url.includes("http")) {
      url = "https://" + url;
    }
    console.log(url);
    setUrls([...urls, url]);
  }

  function dropUrl(event: React.DragEvent<HTMLDivElement>) {
    let data = event.dataTransfer.getData("text");
    addUrl(data);
    return;
  }

  function deleteWorkspace() {
    const workspacesArray = workspaces;
    const workspaceIndex = workspaces.findIndex(
      (item: workspaceType) => item.name == workspace.name
    );
    workspacesArray.splice(workspaceIndex, 1);

    setWorkspaces([...workspacesArray]);
  }

  async function openTabs(urls: string[]) {
    const currentTab = await chrome.tabs.query({ active: true });
    const tabs = await chrome.tabs.query({ active: false });
    const tabIds: number[] = [];
    tabs.map((tab) => {
      if (tab.id) {
        tabIds.push(tab.id);
      }
    });

    await urls.map((oneUrl) => {
      chrome.tabs.create({ url: oneUrl });
    });

    if (settings == "keepCurrent") {
      await chrome.tabs.remove(tabIds);
    }
    if (settings == "keepNone") {
      await chrome.tabs.remove(tabIds);
      if (currentTab[0].id) {
        await chrome.tabs.remove(currentTab[0].id);
      }
    }
  }

  function editWorkspace() {
    const workspacesArray = workspaces;
    const workspaceIndex = workspaces.findIndex(
      (item: workspaceType) => item.name == workspace.name
    );

    workspacesArray[workspaceIndex].urls = urls;
    workspacesArray[workspaceIndex].settings = settings;
    workspacesArray[workspaceIndex].name = workspaceName;
    setWorkspaces([...workspacesArray]);
  }

  useEffect(() => {
    editWorkspace();
  }, [urls, settings, changeNameToggle]);

  const style = { transition, transform: CSS.Transform.toString(transform) };

  return (
    <>
      <div
        style={style}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="bg-zinc-800 rounded-lg flex flex-col gap-2 overflow-hidden shrink-0"
      >
        <div
          className={`group grid grid-cols-[1fr_3fr_1fr] items-center ${
            toggle && "border-b border-y-zinc-600"
          }`}
        >
          <IoFolderOpenOutline
            onClick={(e) => {
              e.stopPropagation();
              openTabs(urls);
            }}
            className="text-zinc-200 text-2xl hover:bg-zinc-600  cursor-pointer bg-zinc-700 min-h-12 min-w-12 p-[10px]"
          />
          <div className="flex items-center justify-start gap-3 justify-self-start ">
            <div className="text-lg">
              {settings == "keepAll" && <TbFolderStar className="" />}
              {settings == "keepCurrent" && <TbFolderUp />}
              {settings == "keepNone" && <TbFolderX />}
            </div>
            <div className="overflow-hidden max-w-30">
              {" "}
              {changeNameToggle ? (
                <input
                  ref={toggleWorkspaceNameInput}
                  onChange={(e) => {
                    setWorkspaceName(e.target.value);
                  }}
                  value={workspaceName}
                  onKeyDown={(e) => {
                    if (e.code == "Enter") {
                      editWorkspace();
                      setChangeNameToggle(false);
                    }
                  }}
                  type="text"
                  className="max-w-30 font-semibold bg-zinc-800 border-2 border-zinc-700 rounded-md px-2"
                ></input>
              ) : (
                <p
                  onClick={() => {
                    setChangeNameToggle(true);
                  }}
                  className=" font-semibold text-nowrap"
                >
                  {workspaceName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {" "}
            <FaPen
              className="cursor-pointer hover:text-emerald-500 justify-self-end"
              onClick={(e) => {
                e.stopPropagation();
                setToggle(!toggle);
              }}
            />
            {toggleDelete ? (
              <div className="flex justify-end mr-3 gap-3">
                <MdKeyboardBackspace
                  className="cursor-pointer hover:text-emerald-400 justify-self-end"
                  onClick={(e) => {
                    e.stopPropagation();
                    setToggleDelete(false);
                  }}
                />
                <IoClose
                  className="cursor-pointer hover:text-rose-400 justify-self-end"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWorkspace();
                  }}
                />
              </div>
            ) : (
              <TiDeleteOutline
                className="cursor-pointer hover:text-rose-400 justify-self-end mr-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setToggleDelete(true);
                }}
              />
            )}
          </div>
        </div>

        {toggle && (
          <>
            <div className="flex items-center justify-center gap-2 font-semibold text-lg">
              <div className="group relative">
                <TbFolderStar
                  onClick={() => {
                    setSettings("keepAll");
                  }}
                  className={`${
                    settings == "keepAll" ? "text-emerald-500" : ""
                  } cursor-pointer`}
                />
                <p className="group-hover:block hidden text-[10px] absolute top-5 bg-zinc-500 p-1 rounded-md">
                  Ponechat všechny záložky
                </p>
              </div>
              <div className="group relative">
                <TbFolderUp
                  onClick={() => {
                    setSettings("keepCurrent");
                  }}
                  className={`${
                    settings == "keepCurrent" ? "text-emerald-500" : ""
                  } cursor-pointer`}
                />
                <p className="group-hover:block hidden text-[10px] absolute top-5 bg-zinc-500 p-1 rounded-md">
                  Zavřít záložky kromě současné
                </p>
              </div>
              <div className="group relative">
                <TbFolderX
                  onClick={() => {
                    setSettings("keepNone");
                  }}
                  className={`${
                    settings == "keepNone" ? "text-emerald-500" : ""
                  } cursor-pointer`}
                />
                <p className="group-hover:block hidden text-[10px] absolute top-5 bg-zinc-500 p-1 rounded-md">
                  Zavřít všechny záložky
                </p>
              </div>
            </div>
            <div className="flex flex-col items-stretch p-2">
              <input
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.code == "Enter") {
                    addUrl(link);
                    setLink("");
                  }
                }}
                placeholder={texts.addLinkPlaceholder}
                onDragEnter={() => {
                  setDragover(true);
                }}
                onDragLeave={() => {
                  setDragover(false);
                }}
                onDrop={(event) => {
                  setDragover(false);
                  event.preventDefault();
                  dropUrl(event);
                }}
                className={`p-4 ${
                  dragover ? "bg-zinc-600" : "bg-zinc-700"
                } text-center rounded-lg border-2 border-zinc-500 text-zinc-400`}
              ></input>
              {urls.map((item) => {
                return (
                  <div
                    key={item}
                    className="grid grid-cols-[4fr_1fr] items-center py-2"
                  >
                    <div className="overflow-hidden">
                      <a href={item} target="_blank" className="text-nowrap">
                        {item}
                      </a>
                    </div>
                    <TiDeleteOutline
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUrl(item);
                      }}
                      className="justify-self-end hover:text-rose-400 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function App() {
  const [workspaces, setWorkspaces] = useState<workspacesType>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");
  const [lang, setLang] = useState<"cs" | "en">("cs");
  const [texts, setTexts] = useState<langType>(localization.cs);
  const [adviceToggle, setAdviceToggle] = useState<boolean>(false);
  const [status, setStatus] = useState<boolean>(false);
  const [addWorkspaceToggle, setAddWorkspaceToggle] = useState<boolean>(false);

  useEffect(() => {
    async function getData() {
      const data = await chrome.storage.sync.get({ workspaces });
      console.log("getData", data.workspaces);
      if (data != null) {
        setWorkspaces(data.workspaces);
      }

      const langData = await chrome.storage.sync.get({ lang });
      if (langData != null) {
        setLang(langData.lang);
      }
    }
    getData();
  }, []);

  useEffect(() => {
    if (lang == "cs") {
      setTexts(localization.cs);
    }
    if (lang == "en") {
      setTexts(localization.en);
    }
  }, [lang]);

  useEffect(() => {
    async function setData() {
      const data = await chrome.storage.sync.set({ workspaces: workspaces });
      console.log("setData", data);
    }

    setData();
  }, [workspaces]);

  const extpay = ExtPay("tabr");

  useEffect(() => {
    async function extensionPay() {
      try {
        const user = await extpay.getUser();
        console.log(user);
        if (user.paid) {
          setStatus(true);
        } else {
          setStatus(false);
        }
      } catch {}
    }

    extensionPay();
  }, []);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    if (!over || active.id === over.id) {
      return;
    } else {
      setWorkspaces((workspaces) => {
        const originalPost = workspaces.findIndex(
          (workspace) => workspace.id === active.id
        );
        const newPost = workspaces.findIndex(
          (workspace) => workspace.id === over.id
        );
        return arrayMove(workspaces, originalPost, newPost);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  async function createWorkspace() {
    const active = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const nonActive = await chrome.tabs.query({
      active: false,
      currentWindow: true,
    });

    const urls: string[] = [];

    active.map((tab) => {
      if (tab.url) {
        urls.push(tab.url);
      }
    });

    nonActive.map((tab) => {
      if (tab.url) {
        urls.push(tab.url);
      }
    });

    setWorkspaces([
      ...workspaces,
      {
        name: newWorkspaceName,
        urls: urls,
        settings: "keepAll",
        id: Math.random() * 1000,
      },
    ]);
    setNewWorkspaceName("");
  }

  return (
    <>
      <div
        className={`bg-zinc-900 h-screen grid grid-rows-[80px_1fr_80px] font-mono text-white`}
      >
        <div className="grid grid-cols-[1fr_3fr_1fr] items-center p-3">
          {adviceToggle && (
            <div className="absolute top-20 left-0 w-full p-2">
              <div className="bg-zinc-800 p-5 rounded-lg flex flex-col gap-4 border-2 border-zinc-700">
                <p>{texts.advice.heading}</p>
                {texts.advice.texts.map((item) => {
                  return (
                    <div key={item.letter} className="flex gap-2">
                      <div className="text-lg">
                        {item.letter == "F" && <IoFolderOpenOutline />}
                        {item.letter == "A" && <TbFolderStar />}
                        {item.letter == "C" && <TbFolderUp />}
                        {item.letter == "N" && <TbFolderX />}
                      </div>
                      <p>{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex">
            <p
              onMouseEnter={() => {
                setAdviceToggle(true);
              }}
              onMouseLeave={() => {
                setAdviceToggle(false);
              }}
            >
              ?
            </p>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <p className="font-semibold text-xl col-start-2 justify-self-center">
              TABR
            </p>
          </div>
          <p
            onClick={() => {
              if (lang == "cs") {
                setLang("en");
                chrome.storage.sync.set({ lang: "en" });
              } else {
                setLang("cs");
                chrome.storage.sync.set({ lang: "cs" });
              }
            }}
            className="justify-self-end cursor-pointer hover:text-emerald-500"
          >
            {lang}
          </p>
        </div>
        {status ? (
          <>
            <div className="flex flex-col gap-5 items-stretch p-3 overflow-auto">
              <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
                modifiers={[
                  restrictToVerticalAxis,
                  restrictToFirstScrollableAncestor,
                ]}
              >
                <SortableContext
                  items={workspaces.map((workspace) => workspace.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {workspaces.map((item) => {
                    return (
                      <Workspace
                        key={item.name}
                        texts={texts}
                        workspaces={workspaces}
                        workspace={item}
                        setWorkspaces={setWorkspaces}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>

              {addWorkspaceToggle ? (
                <div className="grid grid-cols-2 w-full gap-5">
                  <input
                    onKeyDown={(e) => {
                      if (e.code == "Enter") {
                        setWorkspaces([
                          ...workspaces,
                          {
                            name: newWorkspaceName,
                            urls: [],
                            settings: "keepAll",
                            id: Math.random() * 1000,
                          },
                        ]);
                        setNewWorkspaceName("");
                      }
                    }}
                    onChange={(e) => {
                      setNewWorkspaceName(e.target.value);
                    }}
                    value={newWorkspaceName}
                    placeholder={texts.addWorkspacePlaceholder}
                    type="text"
                    className="p-2 bg-zinc-800 border-2 border-zinc-700 w-full rounded-lg col-span-2"
                  ></input>
                  <button
                    onClick={() => {
                      setWorkspaces([
                        ...workspaces,
                        {
                          name: newWorkspaceName,
                          urls: [],
                          settings: "keepAll",
                          id: Math.random() * 1000,
                        },
                      ]);
                      setNewWorkspaceName("");
                      setAddWorkspaceToggle(false);
                    }}
                    className="flex justify-center items-center hover:bg-zinc-700 cursor-pointer py-2 px-1 bg-zinc-800 rounded-lg"
                  >
                    {texts.buttons.addWorkspaceEmpty}
                  </button>
                  <button
                    onClick={() => {
                      createWorkspace();
                      setAddWorkspaceToggle(false);
                    }}
                    className="flex justify-center items-center hover:bg-zinc-700 cursor-pointer py-2 px-1 bg-zinc-800 rounded-lg"
                  >
                    {texts.buttons.addWorkspaceTabs}
                  </button>
                  <button
                    onClick={() => {
                      setAddWorkspaceToggle(false);
                    }}
                    className="flex justify-center items-center hover:bg-zinc-700 cursor-pointer py-2 px-1 bg-zinc-800 rounded-lg col-span-2"
                  >
                    {texts.buttons.addWorkspaceCancel}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center justify-self-center">
                  <button
                    onClick={() => {
                      setAddWorkspaceToggle(true);
                    }}
                    className="text-3xl hover:text-emerald-500 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <p
              onClick={() => {
                extpay.openPaymentPage();
              }}
              className="cursor-pointer hover:text-emerald-500 flex items-center gap-2 justify-center"
            >
              {texts.subscription} <TbReportMoney className="text-xl" />
            </p>
          </>
        ) : (
          <div className="flex items-center justify-start flex-col gap-10 text-center p-3">
            <button
              onClick={() => {
                extpay.openPaymentPage("tabr");
              }}
              className="p-3 bg-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-600"
            >
              {texts.buttons.buy}
            </button>
            <button
              onClick={() => {
                extpay.openPaymentPage("tabr");
              }}
              className="p-3 bg-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-600"
            >
              {texts.buttons.login}
            </button>
            <p>{texts.texts.first}</p>
            <p>{texts.texts.second}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
