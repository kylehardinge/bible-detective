
async function getRandomVerse() {
  let response = await fetch("/api/random");
  const verse = await response.json();
  console.log(verse);
}

