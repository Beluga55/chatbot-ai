import { plansButtons, buttons } from "./plansButtons";
import { redirectSelectService, redirectButton } from "./redirectSelectService";

buttons.forEach((button) => {
  button.addEventListener("click", plansButtons);
});

if (redirectButton) {
  redirectButton.addEventListener("click", redirectSelectService);
}
