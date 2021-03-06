const domIds = [
  'numEdgePoints',
  'numFieldPoints',
  'points',
  'lines',
  'triangles',
  'generate',
  'loader',
  'pointRadius',
  'pointRadiusContainer',
  'lineWidth',
  'lineWidthContainer',
  'distributionRandom',
  'distributionParabolic',
  'distributionGrid',
  'distributionRadial',
  'colorContainer',
  'addColor',
  'colorDistributionDiscrete',
  'colorDistributionContinuous'
];
const dom = {};
const params = {
  numEdgePoints: 20,
  numFieldPoints: 20,
  renderPoints: false,
  renderLines: false,
  renderTriangles: true,
  distribution: 'random',
  lineWidth: 4,
  pointRadius: 5,
  colors: [],
  colorDistribution: 'continuous'
};
const LOADER_ACTIVE = 'loader-active';
const SHAPE_PARAM_ACTIVE = 'shape-param-active';
const TIME_DELAY = 50;
const HEX_REGEX = /[0-9A-F]{6}$/;
let colorPickerCount = 0;

function callPlugin(actionName) {
  if (!actionName) {
    throw new Error('missing action name')
  }
  try {
    const payload = JSON.stringify([].slice.call(arguments));
    console.log(payload);
    window['__skpm_sketchBridge'].callNative(payload);
  } catch(error) {
    closeLoader();
  }
}

function isValidHexColor(hexValue) {
  if (!hexValue || typeof hexValue !== 'string') { return false }
  return HEX_REGEX.test(hexValue.toUpperCase());
}

function getRandomColorComponent() {
  const str = Number(Math.floor(256 * Math.random())).toString(16).toUpperCase();
  const leftPad = str.length > 1 ? '' : '0';
  return `${leftPad}${str}`;
}

function getRandomColor() {
  return `${getRandomColorComponent()}${getRandomColorComponent()}${getRandomColorComponent()}`;
}

function addColorPicker(suppressDelete) {
  const id = `input${++colorPickerCount}`;
  const colorString = getRandomColor();
  const inputElement = document.createElement('input');
  const preview = document.createElement('div');
  const label = document.createElement('label');
  const container = document.createElement('div');
  const closeButton = document.createElement('button');
  const colorRow = document.createElement('div');

  inputElement.addEventListener('change', event => {
    const hexString = event.target.value;
    const isValid = isValidHexColor(hexString);
    if (isValid) {
      preview.style.setProperty('background-color', `#${hexString}`);
      inputElement.classList.remove('color-input-invalid');
    } else {
      inputElement.classList.add('color-input-invalid');
    }
  });
  closeButton.addEventListener('click', () => dom.colorContainer.removeChild(colorRow));
  preview.classList.add('color-preview');
  preview.style.setProperty('background-color', `#${colorString}`);
  inputElement.setAttribute('type', 'text');
  inputElement.setAttribute('value', colorString);
  inputElement.setAttribute('id', id);
  inputElement.classList.add('color-input');
  label.setAttribute('for', id);
  closeButton.classList.add('fab');
  closeButton.classList.add('remove-color-button');
  container.classList.add('color-container');
  colorRow.classList.add('color-row');
  container.appendChild(preview);
  container.appendChild(inputElement);
  container.appendChild(label);
  colorRow.appendChild(container);
  if (!suppressDelete) {
    container.appendChild(closeButton);
  }
  dom.colorContainer.appendChild(colorRow);
}

function getAllColors() {
  const elements = dom.colorContainer.getElementsByClassName('color-input');
  return Array.prototype.slice.call(elements)
    .map(ele => ele.value);
}

function handleDistributionChange(event) {
  if (!event.target.checked) { return; }
  params.distribution = event.target.value;
}

function handleColorDistributionChange(event) {
  if (!event.target.checked) { return; }
  params.colorDistribution = event.target.value;
}

function init() {
  window.closeLoader = () => setTimeout(() => dom.loader.classList.remove(LOADER_ACTIVE), TIME_DELAY);
  domIds.forEach(key => dom[key] = document.getElementById(key));
  dom.numEdgePoints.addEventListener('change', event => params.numEdgePoints = parseInt(event.target.value, 10));
  dom.numFieldPoints.addEventListener('change', event => params.numFieldPoints = parseInt(event.target.value, 10));
  dom.points.addEventListener('change', event => {
    const val = event.target.checked;
    params.renderPoints = val;
    val ?
      dom.pointRadiusContainer.classList.add(SHAPE_PARAM_ACTIVE) :
      dom.pointRadiusContainer.classList.remove(SHAPE_PARAM_ACTIVE);
  });
  dom.pointRadius.addEventListener('change', event => params.pointRadius = parseInt(event.target.value, 10));
  dom.lines.addEventListener('change', event => {
    const val = event.target.checked;
    params.renderLines = val;
    val ?
      dom.lineWidthContainer.classList.add(SHAPE_PARAM_ACTIVE) :
      dom.lineWidthContainer.classList.remove(SHAPE_PARAM_ACTIVE);
  });
  dom.lineWidth.addEventListener('change', event => params.lineWidth = parseInt(event.target.value, 10));
  dom.triangles.addEventListener('change', event => params.renderTriangles = event.target.checked);

  dom.distributionRandom.addEventListener('change', handleDistributionChange);
  dom.distributionParabolic.addEventListener('change', handleDistributionChange);
  dom.distributionGrid.addEventListener('change', handleDistributionChange);
  dom.distributionRadial.addEventListener('change', handleDistributionChange);
  dom.colorDistributionDiscrete.addEventListener('change', handleColorDistributionChange);
  dom.colorDistributionContinuous.addEventListener('change', handleColorDistributionChange);
  dom.generate.addEventListener('click', () => {
    if (!params.renderPoints && !params.renderLines && !params.renderTriangles) { return; }
    const colors = getAllColors();
    const colorsAreValid = colors.every(isValidHexColor);
    if (!colorsAreValid) { return; }
    params.colors = colors;
    dom.loader.classList.add(LOADER_ACTIVE);
    setTimeout(() => callPlugin('GENERATE_FIELD', JSON.stringify(params)), TIME_DELAY);
  });
  dom.addColor.addEventListener('click', () => addColorPicker());
  addColorPicker(true);
  addColorPicker(true);
}
document.addEventListener('DOMContentLoaded', init);
