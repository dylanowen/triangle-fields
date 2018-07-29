import { UI } from 'sketch';
import BrowserWindow from 'sketch-module-web-view';
import triangleField from '../main/triangle-field';

export default function(context) {
  const options = { identifier: 'unique.id', };
  let browserWindow = new BrowserWindow(options)
  browserWindow.on('closed', () => {
    browserWindow = null;
    // TODO: exit plugin and clean up resources
  });
  browserWindow.loadURL('./ui/index.html');

  const closeLoader = () => browserWindow.webContents.executeJavaScript('closeLoader()');

  browserWindow.webContents.on('GENERATE_FIELD', dto => {
    try {
      const params = JSON.parse(dto);
      console.log(params);
      // const sketchObject = context.selection.firstObject();
      const selection = NSDocumentController.sharedDocumentController().currentDocument().selectedLayers().layers();
      if (selection.count() < 1) {
        context.document.showMessage('Select a shape!');
        closeLoader();
        return;
      }
      const sketchObject = selection.firstObject();
      const start = new Date();
      triangleField(context, sketchObject, params);
      const end = new Date();
      closeLoader();
    }
    catch(error) {
      console.log('error:', error);
      closeLoader();
    }
  });

}