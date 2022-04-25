// fetch(baseURL + "3/products/68")
//   .then((res) => res.text())
//   .then((text) => console.log(text));

function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace(/ /g, "-")
    .replace("---", "-")
    .replace("--", "-")
    .replace(/[^\w-]+/g, "");
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-") +
    " " +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(":")
  );
}

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

module.exports = { convertToSlug, formatDate };
