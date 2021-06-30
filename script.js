'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// class Workout {
//   date = new Date();
//   id = (Date.now() + '').slice(-10);
//   constructor(coords, distance, duration) {
//     this.coords = coords;
//     this.distance = distance;
//     this.duration = duration;
//   }
// }

// class Running extends Workout {
//   constructor(coords, distance, duration, cadence) {
//     super(coords, distance, duration);
//     this.cadence = cadence;
//   }
// }

// class Cycling extends Workout {
//   constructor(coords, distance, duration, elevationGain) {
//     super(coords, distance, duration);
//     this.elevationGain = elevationGain;
//   }
// }
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()} ${this.type.slice(
      1
    )} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
  // _setDescription() {
  //   const months = [
  //     'January',
  //     'February',
  //     'March',
  //     'April',
  //     'May',
  //     'June',
  //     'July',
  //     'August',
  //     'September',
  //     'October',
  //     'November',
  //     'December',
  //   ];

  //   this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
  //     months[this.date.getMonth()]
  //   } ${this.date.getDate()}`;
  // }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([12, 51], 45, 150, 852);
// console.log(run1);
class App {
  #map;
  #eventMap;
  #workout = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleEelevationField);
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not find your posirtion');
        }
      );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 20);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(eMap) {
    this.#eventMap = eMap;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  // _hideForm() {
  //   inputDistance.value =
  //     inputDuration.value =
  //     inputCadence.value =
  //     inputElevation.value =
  //       '';
  //   form.style.display = 'none';
  //   form.classList.add('hidden');
  //   setTimeout(() => (form.style.display = 'grid'), 1000);
  // }
  _toggleEelevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    const validInputs = (...input) => input.every(inp => Number.isFinite(inp));
    const allPositive = (...input) => input.every(inp => inp > 0);
    e.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#eventMap.latlng;
    let workout;

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Input have to be positive number');
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration, elevation)
      )
        return alert('Input have to be positive number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workout.push(workout);

    this._renderWorkoutMaker(workout);
    this._rendreWorkout(workout);

    this._hideForm();
  }
  _renderWorkoutMaker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
  _rendreWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;
    if (workout.type === 'running')
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
      `;
    if (workout.tpye === 'cycling')
      htlm += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
          `;
    form.insertAdjacentHTML('afterend', html);
  }
  // let html = `
  //   <li class="workout workout--${workout.type}" data-id="${workout.id}">
  //         <h2 class="workout__title">${workout.description}</h2>
  //         <div class="workout__details">
  //           <span class="workout__icon">${
  //             workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
  //           }</span>
  //           <span class="workout__value">${workout.distance}</span>
  //           <span class="workout__unit">km</span>
  //         </div>
  //         <div class="workout__details">
  //           <span class="workout__icon">⏱</span>
  //           <span class="workout__value">${workout.duration}</span>
  //           <span class="workout__unit">min</span>
  //         </div>
  //   `;
  //   if (workout.type === 'running')
  //     html += `
  //   <div class="workout__details">
  //           <span class="workout__icon">⚡️</span>
  //           <span class="workout__value">${workout.pace.toFixed(1)}</span>
  //           <span class="workout__unit">min/km</span>
  //         </div>
  //         <div class="workout__details">
  //           <span class="workout__icon">🦶🏼</span>
  //           <span class="workout__value">${workout.cadence}</span>
  //           <span class="workout__unit">spm</span>
  //         </div>
  //   `;
  //   if (workout.type === 'cycling')
  //     html += `
  //   <div class="workout__details">
  //           <span class="workout__icon">⚡️</span>
  //           <span class="workout__value">${workout.speed.toFixed(1)}</span>
  //           <span class="workout__unit">km/h</span>
  //         </div>
  //         <div class="workout__details">
  //           <span class="workout__icon">⛰</span>
  //           <span class="workout__value">${workout.elevationGain}</span>
  //           <span class="workout__unit">m</span>
  //         </div>
  //   `;
  //   form.insertAdjacentHTML('afterend', html);
}
const app = new App();
