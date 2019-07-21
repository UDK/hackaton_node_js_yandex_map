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
        zoom: 16,
        controls: ["geolocationControl", "searchControl"]
      },
      (deliveryPoint = new ymaps.GeoObject({
        geometry: { type: "Point" },
        properties: { iconCaption: "Адрес" }
      })),
      {
        searchControlProvider: "yandex#search",
        yandexMapDisablePoiInteractivity: true
      }
    );

    searchControl = myMap.controls.get("searchControl");
    searchControl.options.set({
      noPlacemark: true,
      placeholderContent: "Введите адрес доставки"
    });
    myMap.geoObjects.add(deliveryPoint);

    searchControl = myMap.controls.get("searchControl");
    searchControl.options.set({
      noPlacemark: true,
      placeholderContent: "Введите адрес доставки"
    });
    myMap.geoObjects.add(deliveryPoint);

    function onZonesLoad(json) {
      // Добавляем зоны на карту.
      var deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
      // Задаём цвет и контент балунов полигонов.
      deliveryZones.each(function(obj) {
        var color = obj.options.get("fillColor");
        color = color.substring(0, color.length - 2);
        obj.options.set({ fillColor: color, fillOpacity: 0.4 });
        obj.properties.set("balloonContent", obj.properties.get("name"));
        obj.properties.set(
          "balloonContentHeader",
          "Стоимость доставки: " + obj.properties.get("price") + " р."
        );
      });

      // Проверим попадание результата поиска в одну из зон доставки.
      searchControl.events.add("resultshow", function(e) {
        highlightResult(searchControl.getResultsArray()[e.get("index")]);
      });

      // Проверим попадание метки геолокации в одну из зон доставки.
      myMap.controls
        .get("geolocationControl")
        .events.add("locationchange", function(e) {
          highlightResult(e.get("geoObjects").get(0));
        });

      // При перемещении метки сбрасываем подпись, содержимое балуна и перекрашиваем метку.
      deliveryPoint.events.add("dragstart", function() {
        deliveryPoint.properties.set({ iconCaption: "", balloonContent: "" });
        deliveryPoint.options.set("iconColor", "black");
      });

      // По окончании перемещения метки вызываем функцию выделения зоны доставки.
      deliveryPoint.events.add("dragend", function() {
        highlightResult(deliveryPoint);
      });

      function highlightResult(obj) {
        // Сохраняем координаты переданного объекта.
        var coords = obj.geometry.getCoordinates(),
          // Находим полигон, в который входят переданные координаты.
          polygon = deliveryZones.searchContaining(coords).get(0);

        if (polygon) {
          // Уменьшаем прозрачность всех полигонов, кроме того, в который входят переданные координаты.
          deliveryZones.setOptions("fillOpacity", 0.4);
          polygon.options.set("fillOpacity", 0.8);
          // Перемещаем метку с подписью в переданные координаты и перекрашиваем её в цвет полигона.
          deliveryPoint.geometry.setCoordinates(coords);
          deliveryPoint.options.set(
            "iconColor",
            polygon.options.get("fillColor")
          );
          // Задаем подпись для метки.
          if (typeof obj.getThoroughfare === "function") {
            setData(obj);
          } else {
            // Если вы не хотите, чтобы при каждом перемещении метки отправлялся запрос к геокодеру,
            // закомментируйте код ниже.
            ymaps.geocode(coords, { results: 1 }).then(function(res) {
              var obj = res.geoObjects.get(0);
              setData(obj);
            });
          }
        } else {
          // Если переданные координаты не попадают в полигон, то задаём стандартную прозрачность полигонов.
          deliveryZones.setOptions("fillOpacity", 0.4);
          // Перемещаем метку по переданным координатам.
          deliveryPoint.geometry.setCoordinates(coords);
          // Задаём контент балуна и метки.
          deliveryPoint.properties.set({
            iconCaption: "Доставка транспортной компанией",
            balloonContent: "Cвяжитесь с оператором",
            balloonContentHeader: ""
          });
          // Перекрашиваем метку в чёрный цвет.
          deliveryPoint.options.set("iconColor", "black");
        }

        function setData(obj) {
          var address = [
            obj.getThoroughfare(),
            obj.getPremiseNumber(),
            obj.getPremise()
          ].join(" ");
          if (address.trim() === "") {
            address = obj.getAddressLine();
          }
          deliveryPoint.properties.set({
            iconCaption: address,
            balloonContent: address,
            balloonContentHeader:
              "<b>Стоимость доставки: " +
              polygon.properties.get("price") +
              " р.</b>"
          });
        }
      }
    }

    $.ajax({
      url: "js/data.json",
      dataType: "json",
      success: onZonesLoad
    });
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
        document
          .querySelector(".button-delete")
          .addEventListener("click", () => {
            myMap.geoObjects.removeAll();
          });
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
        // myMap.geoObjects.removeAll();
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
      {
        hintContent: "дорога",
        balloonContent: "4/10",
        balloonContentHeader: "Загруженность дороги",
        balloonContentFooter: "Дополнительная информация о дороге"
      },
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
      {
        hintContent: "дорога",
        balloonContent: "1/10",
        balloonContentHeader: "Загруженность дороги",
        balloonContentFooter: "Дополнительная информация о дороге"
      },
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
  }
}
