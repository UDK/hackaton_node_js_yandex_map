let OPEN_POPAP = false;
let POINT_COORD = [];
let ROAD_1 = [];
let ROAD_2 = [];
let COLOR_1 = "";
let COLOR_2 = "";
let ADD_ROAD_1 = [];
let ADD_ROAD_2 = [];

window.addEventListener("load", () => {
  ymaps.ready(init);

  function init() {
    // Создаем карту.
    var myMap = new ymaps.Map(
      "map",
      {
        center: [48.756566, 44.510171],
        zoom: 16
      },
      {
        searchControlProvider: "yandex#search",
        yandexMapDisablePoiInteractivity: true
      }
    );

    let myCoords = null;
    myMap.events.add("click", e => {
      var coords = e.get("coords");
      myCoords = coords;
      POINT_COORD = coords;
      console.log(myCoords);

      MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
      );

      if (!OPEN_POPAP) {
        // Создаем метку.
        console.log("Создаем метку");
        OPEN_POPAP = !OPEN_POPAP;
        var myPlacemark = new ymaps.Placemark(
          [myCoords[0], myCoords[1]],
          {
            hintContent: "Собственный значок метки с контентом"
            // balloonContent: "А эта — новогодняя",
            // iconContent: "12"
          },
          {
            // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: "default#imageWithContent",
            // Своё изображение иконки метки.
            iconImageHref: "js/icon.png",
            // Размеры метки.
            iconImageSize: [48, 48],
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: [-24, -24],
            // Смещение слоя с содержимым относительно слоя с картинкой.
            iconContentOffset: [15, 15],
            // Макет содержимого.
            iconContentLayout: MyIconContentLayout
          }
        );
        // console.log(myPlacemark);

        // Контекстное меню, позволяющее изменить параметры метки.
        // Вызывается при нажатии правой кнопкой мыши на метке.
        // ($"#menu").click(function
        myPlacemark.events.add("contextmenu", e => {
          // Если меню метки уже отображено, то убираем его.
          console.log("добавить окно");
          if ($("#menu").css("display") == "flex") {
            $("#menu").remove();
          } else {
            console.log("object");
            // HTML-содержимое контекстного меню.
            var menuContent = `<div id="menu">
                                <h2 class="menu__title">Добавление стресс объекта</h2>
                                <div class="menu__item">
                                  <label for="nameObject" class="menu__item-name">Введите название объекта</label>
                                  <input id="nameObject" type="text" class="menu__item-input" />

                                  <label for="carsObject" class="menu__item-name">Машины в ед. вр.</label>
                                  <input id="carsObject" type="text" class="menu__item-input" />
                                  <button class="menu__button">Отправить</button>
                                </div>
                                
                               </div>`;

            // Размещаем контекстное меню на странице
            $("body").append(menuContent);

            // Задаем позицию меню.
            $("#menu").css({
              left: e.get("pagePixels")[0],
              top: e.get("pagePixels")[1]
            });
            document
              .querySelector(".menu__button")
              .addEventListener("click", () => {
                let inputField = document.querySelector(".menu__item-input")
                  .value;
                let countCars = document.querySelector("#carsObject").value;
                console.log(countCars, inputField, POINT_COORD);

                // ОТПРАВЛЯЕМ НА СЕРВЕР
                fetch("/api/roads", {
                  method: "post", // *GET, POST, PUT, DELETE, etc.
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ POINT_COORD, countCars })
                })
                  .then(res => res.json())
                  .then(data => {
                    console.log("POSTED", data);
                    ROAD_1 = data[0][0];
                    ROAD_2 = data[1][0];
                    COLOR_1 = data[0][1];
                    COLOR_2 = data[1][1];
                    if (data[2] === undefined) {
                      console.log("asdasd");
                    } else if (data[2][0].length + data[2][1].length == 4) {
                      //console.log("DATA2", data[2]);
                      ADD_ROAD_1 = data[2][0];
                      ADD_ROAD_2 = data[2][1];
                    } else {
                      console.log("DATA2_1", data[2]);
                      ADD_ROAD_1 = data[2];
                    }

                    // myMap.geoObjects.add(myPlacemark);
                    const asyncFunc = async () => {
                      //console.log("ROAD_1", ROAD_1, "ROAD_2", ROAD_2);
                      const coords = [ROAD_2, ROAD_1];
                      await draw_line(
                        myMap,
                        coords,
                        COLOR_1,
                        COLOR_2,
                        ADD_ROAD_1,
                        ADD_ROAD_2
                      );
                    };
                    asyncFunc();
                    console.log("myPlacemark", myPlacemark);
                    myPlacemark.properties._data.hintContent = inputField;
                    //console.log("Удаляем метку");
                    $("#menu").remove();
                    // myPlacemark.remove();
                    // myMap.geoObjects.removeAll();
                  });
              });
          }
        });
        myMap.geoObjects.add(myPlacemark);
        // myMap.geoObjects.add(myPlacemark);
        // const asyncFunc = async () => {
        //   console.log("ROAD_1", ROAD_1, "ROAD_2", ROAD_2);
        //   const coords = [ROAD_2, ROAD_1];
        //   await draw_line(myMap, coords);
        // };
        // asyncFunc();
      } else {
        console.log("Удаляем метку");
        $("#menu").remove();
        OPEN_POPAP = !OPEN_POPAP;
        // myMap.geoObjects.removeAll();
      }
    });
  }
});

function draw_line(_myMap, coords, color_1, color_2, add_1, add_2) {
  ymaps.ready(["AnimatedLine"]).then(init);

  function init(ymaps) {
    console.log(...coords, "COORDS");
    var firstAnimatedLine = new ymaps.AnimatedLine(
      [...coords[0]],
      {},
      {
        // Задаем цвет.
        strokeColor: `#${color_1}`,
        // Задаем ширину линии.
        strokeWidth: 5
        // Задаем длительность анимации.
        // animationTime: 0
      }
    );
    var secondAnimatedLine = new ymaps.AnimatedLine(
      [...coords[1]],
      {},
      {
        strokeColor: `#${color_2}`,
        strokeWidth: 5
        // animationTime: 0
      }
    );
    console.log("add_1", add_1);
    var animatedLine_3 = new ymaps.AnimatedLine(
      [POINT_COORD, add_1],
      {},
      {
        strokeColor: `#4edb64`,
        strokeWidth: 8
        // animationTime: 0
      }
    );
    console.log("add_2", add_2);
    var animatedLine_4 = new ymaps.AnimatedLine(
      [POINT_COORD, add_2],
      {},
      {
        strokeColor: `#4edb64`,
        strokeWidth: 8
        // animationTime: 0
      }
    );
    // Добавляем линии на карту.
    _myMap.geoObjects.add(firstAnimatedLine);
    _myMap.geoObjects.add(secondAnimatedLine);
    _myMap.geoObjects.add(animatedLine_3);
    _myMap.geoObjects.add(animatedLine_4);
    // Создаем метки.
    var firstPoint = new ymaps.Placemark(
      ...coords[0],
      {},
      {
        preset: "islands#redRapidTransitCircleIcon"
      }
    );
    var secondPoint = new ymaps.Placemark(
      ...coords[1],
      {},
      {
        preset: "islands#blueMoneyCircleIcon"
      }
    );
    var thirdPoint = new ymaps.Placemark(
      [55.763105418792314, 37.57724573612205],
      {},
      {
        preset: "islands#blackZooIcon"
      }
    );
    // Функция анимации пути.
    // function playAnimation() {
    //   // Убираем вторую линию.
    //   secondAnimatedLine.reset();
    //   // Добавляем первую метку на карту.
    //   _myMap.geoObjects.add(firstPoint);
    //   // Анимируем первую линию.
    //   firstAnimatedLine
    //     .animate()
    //     // После окончания анимации первой линии добавляем вторую метку на карту и анимируем вторую линию.
    //     .then(() => {
    //       _myMap.geoObjects.add(secondPoint);
    //       return secondAnimatedLine.animate();
    //     })
    //     // После окончания анимации второй линии добавляем третью метку на карту.
    //     .then(function() {
    //       // _myMap.geoObjects.add(thirdPoint);
    //       // Добавляем паузу после анимации.
    //       return ymaps.vow.delay(null, 2000);
    //     })
    //     // После паузы перезапускаем анимацию.
    //     .then(function() {
    //       // Удаляем метки с карты.
    //       _myMap.geoObjects.remove(firstPoint);
    //       _myMap.geoObjects.remove(secondPoint);
    //       // _myMap.geoObjects.remove(thirdPoint);
    //       // Убираем вторую линию.
    //       secondAnimatedLine.reset();
    //       // Перезапускаем анимацию.
    //       playAnimation();
    //     });
    // }
    // Запускаем анимацию пути.
    // playAnimation();
  }
}
