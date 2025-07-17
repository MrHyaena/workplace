import React, { useEffect, useState } from "react";
import { CiLink } from "react-icons/ci";
import { FaPen } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdKeyboardBackspace } from "react-icons/md";
import { TiDeleteOutline } from "react-icons/ti";
import { localization } from "./localization";

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

  useEffect(() => {
    const workspacesArray = workspaces;
    const workspaceIndex = workspaces.findIndex(
      (item: workspaceType) => item.name == workspace.name
    );

    workspacesArray[workspaceIndex].urls = urls;
    workspacesArray[workspaceIndex].settings = settings;
    setWorkspaces([...workspacesArray]);
  }, [urls, settings]);

  return (
    <>
      <div className="bg-zinc-800 rounded-lg flex flex-col gap-2 overflow-hidden">
        <div
          className={`group grid grid-cols-[1fr_3fr_1fr] items-center ${
            toggle && "border-b border-y-zinc-600"
          }`}
        >
          <CiLink
            onClick={(e) => {
              e.stopPropagation();
              openTabs(urls);
            }}
            className="text-zinc-200 text-3xl hover:bg-zinc-600  cursor-pointer bg-zinc-700 min-h-12 min-w-12 p-[10px]"
          />
          <div className="flex items-center gap-3 justify-self-center">
            <p className=" font-semibold ">{workspace.name}</p>
            <FaPen
              className="cursor-pointer hover:text-emerald-500 justify-self-end"
              onClick={(e) => {
                e.stopPropagation();
                setToggle(!toggle);
              }}
            />
            <p className=" font-semibold">
              {settings == "keepAll" && "A"}
              {settings == "keepCurrent" && "C"}
              {settings == "keepNone" && "N"}
            </p>
          </div>
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

        {toggle && (
          <>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <p
                onClick={() => {
                  setSettings("keepNone");
                }}
                className={`${
                  settings == "keepNone" ? "text-emerald-500" : ""
                } cursor-pointer`}
              >
                N
              </p>
              <p
                onClick={() => {
                  setSettings("keepCurrent");
                }}
                className={`${
                  settings == "keepCurrent" ? "text-emerald-500" : ""
                } cursor-pointer`}
              >
                C
              </p>
              <p
                onClick={() => {
                  setSettings("keepAll");
                }}
                className={`${
                  settings == "keepAll" ? "text-emerald-500" : ""
                } cursor-pointer`}
              >
                A
              </p>
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
                      <a href={item} className="text-nowrap">
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

  useEffect(() => {
    async function getData() {
      const data = await chrome.storage.local.get({ workspaces });
      console.log("getData", data.workspaces);
      if (data != null) {
        setWorkspaces(data.workspaces);
      }
    }

    getData();
  }, []);

  useEffect(() => {
    async function setData() {
      const data = await chrome.storage.local.set({ workspaces: workspaces });
      console.log("setData", data);
    }

    setData();
  }, [workspaces]);

  return (
    <>
      <div
        className={`bg-zinc-900 min-h-screen grid grid-rows-[80px_1fr] font-mono text-white`}
      >
        <div className="grid grid-cols-[1fr_3fr_1fr] items-center p-3">
          {adviceToggle && (
            <div className="absolute top-20 left-0 w-full p-2">
              <div className="bg-zinc-800 p-5 rounded-lg flex flex-col gap-4">
                <p>{texts.advice.heading}</p>
                {texts.advice.texts.map((item) => {
                  return (
                    <div key={item.letter} className="flex gap-2">
                      <p>{item.letter}:</p>
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
          <p className="font-semibold text-xl col-start-2 justify-self-center">
            LINKER
          </p>
          <p
            onClick={() => {
              if (lang == "cs") {
                setTexts(localization.en);
                setLang("en");
              } else {
                setTexts(localization.cs);
                setLang("cs");
              }
            }}
            className="justify-self-end cursor-pointer hover:text-emerald-500"
          >
            {lang}
          </p>
        </div>
        <div className="flex flex-col gap-5 items-stretch p-3">
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
          <div className="flex w-full gap-5">
            <input
              onChange={(e) => {
                setNewWorkspaceName(e.target.value);
              }}
              value={newWorkspaceName}
              placeholder={texts.addWorkspacePlaceholder}
              type="text"
              className="p-2 bg-zinc-800 border-2 border-zinc-700 w-full rounded-lg"
            ></input>
            <p
              onClick={() => {
                setWorkspaces([
                  ...workspaces,
                  { name: newWorkspaceName, urls: [], settings: "keepAll" },
                ]);
                setNewWorkspaceName("");
              }}
              className="flex justify-center items-center text-3xl hover:text-emerald-500 cursor-pointer"
            >
              +
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
