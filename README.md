# WebCamera
**Mendix Camera Widget which built on [Media Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API)**

<p align="center">
 <img src="/mx-camera.png" />       
</p>

## Releases:
The latest release [WebCamera.mpk (v1.0-beta)](https://github.com/bizzomate/WebCamera/releases)

## Demo
[Bizzo Photo Gallery](https://pwademo2.mxapps.io/) is Progressive Web App uses WebCamera widget as a showcase of the functionality provided by the widget.

<p align="center">
<img src="https://github.com/bizzomate/WebCamera/blob/master/bizzo-photo-gallery.gif?raw=true" width="360px"/>
</p>

## Usage:
* Place this widget in a 'dataview' that is initialized with an entity which inherits from the entity 'System.Image'.

* This widget serves as a camera sub-application/service and it will overlay the content of the page where it was added, therefore it's recommended to create a special layout ( empty layout | e.g. my_empty_layout) and add the the widget to an empty page as the image below : 

<p align="center">
<img src="https://github.com/bizzomate/WebCamera/blob/master/empty_layout.png?raw=true"/>
</p>

## Configuration :

### 1. Behaviour:

* **onImageSaved** select the microflow/action that will be triggered upon successfully saving the captured image.

* **OnSaveClose**  If your 'onImageSaved' action includes 'closePage' activity set this prop to 'Yes' in order to stop the camera.

<p align="center">
<img src="https://github.com/bizzomate/WebCamera/blob/master/behaviour.png?raw=true"/>
</p>


### 2. Camear Configuration:

* **Image Format** select the format of the captured image.

* **Image Qulaity** set the compression ratio of the captured image.

<p align="center">
<img src="https://github.com/bizzomate/WebCamera/blob/master/camera-conf.png?raw=true"/>
</p>

## Issues:
If you encounter any issue while using this widget, please report it [here](https://github.com/bizzomate/WebCamera/issues)

