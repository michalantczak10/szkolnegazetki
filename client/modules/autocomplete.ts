// Autocomplete module
export function setupParcelAutocomplete(parcelLockers: any[], parcelSearchInput: HTMLInputElement, parcelLockerCodeInput: HTMLInputElement, searchAutocompleteBox: HTMLElement) {
  parcelSearchInput.addEventListener("input", () => {
    const value = parcelSearchInput.value.trim().toLowerCase();
    searchAutocompleteBox.innerHTML = "";
    searchAutocompleteBox.style.width = parcelSearchInput.offsetWidth + "px";
    if (!value) {
      searchAutocompleteBox.style.display = "none";
      return;
    }
    if (!parcelLockers || parcelLockers.length === 0) {
      searchAutocompleteBox.style.display = "block";
      const noResult = document.createElement("div");
      noResult.className = "autocomplete-option autocomplete-no-result";
      noResult.textContent = "Brak danych paczkomatów";
      searchAutocompleteBox.appendChild(noResult);
      return;
    }
    const matches = parcelLockers.filter((locker: any) =>
      locker.name.toLowerCase().includes(value) ||
      locker.address.toLowerCase().includes(value) ||
      locker.code.toLowerCase().includes(value)
    );
    if (matches.length > 0) {
      searchAutocompleteBox.style.display = "block";
      matches.forEach((locker: any, idx: number) => {
        const option = document.createElement("div");
        option.className = "autocomplete-option";
        const code = document.createElement("strong");
        code.textContent = locker.code;
        option.appendChild(code);
        option.appendChild(document.createTextNode(` — ${locker.name}, ${locker.address}`));
        option.addEventListener("mousedown", (e) => {
          // Zapobiegaj blur na input zanim handler się wykona
          e.preventDefault();
          parcelLockerCodeInput.value = locker.code;
          // Wywołaj walidację nasłuchującą na "input" po programowym ustawieniu kodu
          parcelLockerCodeInput.dispatchEvent(new Event("input", { bubbles: true }));
          parcelSearchInput.value = `${locker.name}, ${locker.address}`;
          searchAutocompleteBox.innerHTML = "";
          searchAutocompleteBox.style.display = "none";
        });
        // Dodaj atrybut do łatwego wyboru Enterem
        option.setAttribute("data-idx", idx.toString());
        searchAutocompleteBox.appendChild(option);
      });
      // Obsługa Enter: wybierz pierwszą opcję
      parcelSearchInput.onkeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && matches.length > 0) {
          e.preventDefault();
          const first = searchAutocompleteBox.querySelector('.autocomplete-option[data-idx="0"]') as HTMLElement;
          if (first) first.click();
        }
      };
    } else {
      searchAutocompleteBox.style.display = "block";
      const noResult = document.createElement("div");
      noResult.className = "autocomplete-option autocomplete-no-result";
      noResult.textContent = "Brak wyników";
      searchAutocompleteBox.appendChild(noResult);
      parcelSearchInput.onkeydown = null;
    }
  });
  parcelSearchInput.addEventListener("blur", () => {
    setTimeout(() => {
      searchAutocompleteBox.innerHTML = "";
      searchAutocompleteBox.style.display = "none";
    }, 150);
  });
}