import { Notyf } from "notyf";

export const notyf = new Notyf({
  duration: 3000,
  position: {
    x: "right",
    y: "top",
  },
  dismissible: true,
  icon: true,
});

// Path: client/javascript/notyfInstance.js