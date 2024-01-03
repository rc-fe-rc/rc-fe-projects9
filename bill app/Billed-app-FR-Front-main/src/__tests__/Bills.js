/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //Unit test #2
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

//Unit test #3 & #4

describe("When I click on the icon eye", () => {
  test("Then a modal should open", () => {
    document.body.innerHTML = BillsUI({ data: bills });

    const billsList = new Bills({
      document,
      onNavigate: (pathname) => (document.body.innerHTML = ROUTES({ pathname })),
      store,
      localStorageMock,
    });

    $.fn.modal = jest.fn(); //mock the modal

    const eye = screen.getAllByTestId("icon-eye")[0]; //test on the first icon
    const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eye)); //mock and modify the function
    eye.addEventListener("click", handleClickIconEye);
    userEvent.click(eye);
    expect(handleClickIconEye).toHaveBeenCalled();

    const modale = screen.getByTestId("modaleFile");
    expect(modale).toBeTruthy();
  });
});

describe("When I click on the newbill button", () => {
  test("It should display the form", () => {
    document.body.innerHTML = BillsUI({ data: bills });

    const billsList = new Bills({
      document,
      onNavigate: (pathname) => (document.body.innerHTML = ROUTES({ pathname })),
      store,
      localStorageMock,
    });

    const btnNewBill = screen.getByTestId("btn-new-bill");
    const handleClickNewBill = jest.fn(billsList.handleClickNewBill());
    const formPage = screen.getByText("Envoyer une note de frais");

    btnNewBill.addEventListener("click", handleClickNewBill);
    userEvent.click(btnNewBill);

    expect(formPage).toBeTruthy();
  });
});


// test d'intégration GET
describe("Given I am a user connected as an employee", () => {
describe("When I navigate to Bills Page", () => {
  test("fetches bills from mock API GET", async () => {
    const storeSpy = jest.spyOn(store, "bills");
    const userBills = await store.bills().list();
    expect(storeSpy).toHaveBeenCalled();
    expect(userBills.length).toBe(4);
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    store.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });

    document.body.innerHTML = BillsUI({ error: "Erreur 404" });
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches bills from an API and fails with 500 message error", async () => {
    store.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    document.body.innerHTML = BillsUI({ error: "Erreur 500" });
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
});




