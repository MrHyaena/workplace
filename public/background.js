import ExtPay from "extpay";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.log(error));

var extpay = ExtPay("tabr");
extpay.startBackground();
