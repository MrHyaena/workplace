import ExtPay from "extpay";
import browser from "webextension-polyfill";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.log(error));

var extpay = ExtPay("tabr");
extpay.startBackground();

browser.runtime.onInstalled.addListener(() => {
  console.log("Installed!");
});
