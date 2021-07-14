const html = document.documentElement;
const canvas = document.getElementById("gangneung");
const context = canvas.getContext("2d");
const comment = document.getElementById("comment");
const weather = document.getElementById("weather");
const buttons = document.querySelectorAll("button");
const mapSpace = document.getElementById("mapspace");
const mapCaptions = ["Day 1 오죽헌", "Day 1 향호해변", "Day 1 경포호", "Day 1 월화거리", "Day 2 보사노바 강릉점", "Day 2 정동진 레일바이크", "Day 2 중앙시장", "강릉역"];
const mapTimestamps = ["1626253786018", "1626257191473", "1626240285156", "1626242396941", "1626252770645", "1626260290976", "1626260341015", "1626260379700"];
const mapKeys = ["26mka", "26mm4", "26mdu", "26meq", "26mk2", "26mmb", "26mmc", "26mmd"];
let isMapVisible = false;
let lastScrollTop = 0;
let timer = null;
const frameCount = 8;
const currentFrame = index => `https://github.com/pyville/gangneung/blob/main/images/${index}.jpg?raw=true`
let currentFrameIndex = 0
const preloadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
  }
};
const img = new Image()
img.src = currentFrame(currentFrameIndex);
comment.innerText = mapCaptions[currentFrameIndex];
canvas.width=1158;
canvas.height=770;
img.onload=function(){
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
}

const updateImage = (index) => {
  img.src = currentFrame(index);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  comment.innerText = mapCaptions[index > 0 ? index : 0];
}

const toggleMap = () => {
  const mapFrame = mapSpace.querySelector('div')
  mapFrame.style.visibility === "hidden" ? mapFrame.style.visibility = "visible" : mapFrame.style.visibility = "hidden"
}

const scrollMaps = (index) => {
  mapSpace.innerHTML = ""
  const mapFrame = document.createElement('div')
  mapFrame.className = "root_daum_roughmap root_daum_roughmap_landing"
  mapFrame.id = `daumRoughmapContainer${mapTimestamps[index]}`
  mapFrame.style.visibility = "hidden" 
  mapSpace.appendChild(mapFrame)
  new daum.roughmap.Lander({
		"timestamp" : mapTimestamps[index],
		"key" : mapKeys[index],
		"mapWidth" : "320",
		"mapHeight" : "200"
	}).render();
}

const scrollUp = () => {
  scrollBy({
    top: -window.innerHeight,
    left: 0,
    behavior: 'smooth'
  });
  currentFrameIndex = currentFrameIndex > 0 ? currentFrameIndex - 1 : currentFrameIndex
  scrollMaps(currentFrameIndex)
  requestAnimationFrame(() => updateImage(currentFrameIndex))
}

const scrollDown = () => {
  scrollBy({
    top: window.innerHeight,
    left: 0,
    behavior: 'smooth'
  });
  currentFrameIndex = currentFrameIndex < 7 ? currentFrameIndex + 1 : currentFrameIndex
  scrollMaps(currentFrameIndex)
  requestAnimationFrame(() => updateImage(currentFrameIndex))
}

const renderWeather = (obj, text) => {
    const div = document.createElement('div')
    const img = document.createElement('img')
    const { icon, description } = obj.weather[0]
    div.innerText = `${text}`
    img.src = `http://openweathermap.org/img/wn/${icon}.png`
    img.height = 20
    img.alt = description
    div.appendChild(img)
    const temp_min = Math.round(obj.main.temp_min)
    const temp_max = Math.round(obj.main.temp_max)
    div.innerHTML += temp_min === temp_max ? `${temp_min}°C` : `${temp_min}°C/${temp_max}°C`
    return div
}

const getWeather = (location, lat, lon) => {

    const baseURL = location === '현재 위치' ? `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=e9bbeb89479aa30ba09fa9b8e10f2498&units=metric` : `http://api.openweathermap.org/data/2.5/weather?q=${location},kr&appid=e9bbeb89479aa30ba09fa9b8e10f2498&units=metric`
    const req = new Request(baseURL)
    
    fetch(req)
        .then((res)=>res.json())
        .then((obj)=>{
            weather.appendChild(renderWeather(obj, location === "Gangneung" ? "강릉" : "현재 위치"));
        })
        .catch((error)=>weather.innerText = "날씨를 불러오지 못했습니다.")
}

window.addEventListener('load', ()=>{
    navigator.geolocation.getCurrentPosition((pos)=>{
        getWeather("현재 위치", pos.coords.latitude, pos.coords.longitude)
    })
})

window.addEventListener('scroll', (e) => {  
  e.preventDefault()
  const scrollTop = html.scrollTop;
  if (!timer) {
    timer = setTimeout(()=>{
      timer = null;
    }, 1000)
    
    if (scrollTop < lastScrollTop) { // up
      scrollUp()
    } else { // down
      scrollDown()
    }
  } 
  lastScrollTop = scrollTop
});

window.addEventListener('keydown', (e)=>{
  e.preventDefault()
  if (!timer) {
    timer = setTimeout(()=>{
      timer = null;
    }, 100)
    switch (e.keyCode) {
      case 40: //down key
        scrollDown()
        break;
      case 38: //up key
        scrollUp()
        break;
      default:
    }
  }
})

comment.addEventListener('click', (e)=>{
  e.preventDefault();
  toggleMap();
})

preloadImages()
scrollMaps(0)
getWeather("Gangneung")
