import countries from "./data/country.json";
const form = document.getElementById("country-form") as HTMLFormElement;
const submitCountryBtn = document.getElementById(
  "selectCountryBtn"
) as HTMLInputElement;

const select = document.createElement("select");
select.id = "country-select";
select.name = "country";
select.required = true;
select.className = "w-full border border-gray-300 py-3 px-4 rounded-lg mb-4";

const defaultOption = document.createElement("option");
defaultOption.value = "";
defaultOption.disabled = true;
defaultOption.selected = true;
defaultOption.textContent = "Select a country";
select.appendChild(defaultOption);

countries.forEach((country: string) => {
  const option = document.createElement("option");
  option.value = country;
  option.textContent = country;
  select.appendChild(option);
});

form.insertBefore(select, submitCountryBtn);
