import React, { useEffect, useState } from "react";
import { CiLink } from "react-icons/ci";
import { FaPen } from "react-icons/fa";
import { TiDeleteOutline } from "react-icons/ti";

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
  name: string;
  urls: string[];
};

type workspacesType = workspaceType[];

function Workspace({
  workspaces,
  workspace,
  setWorkspaces,
}: {
  workspaces: workspaceType[];
  workspace: workspaceType;
  setWorkspaces: React.Dispatch<React.SetStateAction<workspacesType>>;
}) {
  const [toggle, setToggle] = useState<boolean>(false);
  const [urls, setUrls] = useState<string[]>(workspace.urls);
  const [dragover, setDragover] = useState<boolean>(false);

  function deleteUrl(item: string) {
    const newArray = urls.filter((url) => item != url);
    setUrls([...newArray]);
  }

  function dropUrl(event: React.DragEvent<HTMLDivElement>) {
    let data = event.dataTransfer.getData("text");
    if (data[0] != "h" && data[1] != "t" && data[2] != "t" && data[3] != "p") {
      data = "https://" + data;
    }
    console.log(data);
    setUrls([...urls, data]);
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

    await chrome.tabs.remove(tabIds);
    await urls.map((oneUrl) => {
      chrome.tabs.create({ url: oneUrl });
    });

    if (currentTab[0].id) {
      await chrome.tabs.remove(currentTab[0].id);
    }
  }

  useEffect(() => {
    const workspacesArray = workspaces;
    const workspaceIndex = workspaces.findIndex(
      (item: workspaceType) => item.name == workspace.name
    );

    workspacesArray[workspaceIndex].urls = urls;
    setWorkspaces([...workspacesArray]);
  }, [urls]);

  return (
    <>
      <div className="bg-zinc-800 p-2 rounded-lg flex flex-col gap-5">
        <div className="grid grid-cols-[1fr_3fr_1fr] items-center">
          <CiLink
            onClick={() => {
              openTabs(urls);
            }}
            className="text-zinc-200 text-3xl hover:text-emerald-500 cursor-pointer"
          />
          <div className="flex items-center gap-3 justify-self-center">
            <p className=" font-semibold ">{workspace.name}</p>
            <FaPen
              className="cursor-pointer hover:text-emerald-500 justify-self-end"
              onClick={() => {
                setToggle(!toggle);
              }}
            />
          </div>
          <TiDeleteOutline
            className="cursor-pointer hover:text-rose-400 justify-self-end"
            onClick={() => {
              deleteWorkspace();
            }}
          />
        </div>
        {toggle && (
          <div className="flex flex-col items-stretch">
            <div
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
            >
              Zde vložte odkaz
            </div>
            {urls.map((item) => {
              return (
                <>
                  <div className="grid grid-cols-[4fr_1fr] items-center py-2">
                    <div className="overflow-hidden">
                      <a href={item} className="text-nowrap">
                        {item}
                      </a>
                    </div>
                    <TiDeleteOutline
                      onClick={() => {
                        deleteUrl(item);
                      }}
                      className="justify-self-end hover:text-rose-400 cursor-pointer"
                    />
                  </div>
                </>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function App() {
  const [workspaces, setWorkspaces] = useState<workspacesType>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");

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
        className={`bg-zinc-900 h-screen grid grid-rows-[80px_1fr] font-mono text-white`}
      >
        <div className="flex justify-center items-center ">
          <p className="font-semibold text-xl">LINKER</p>
        </div>
        <div className="flex flex-col gap-5 items-stretch p-3">
          {workspaces.map((item) => {
            return (
              <Workspace
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
              placeholder="Přidejte workspace"
              type="text"
              className="p-2 bg-zinc-800 border-2 border-zinc-700 w-full rounded-lg"
            ></input>
            <p
              onClick={() => {
                setWorkspaces([
                  ...workspaces,
                  { name: newWorkspaceName, urls: [] },
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
