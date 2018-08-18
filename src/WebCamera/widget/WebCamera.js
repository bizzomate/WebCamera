define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/fx",
    "dojo/_base/fx",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "dojo/on"
], function(
    declare,
    _WidgetBase,
    dom,
    dojoDom,
    dojoProp,
    dojoGeometry,
    dojoClass,
    dojoStyle,
    fx,
    fxBase,
    dojoDomAttr,
    dojoConstruct,
    dojoArray,
    lang,
    dojoText,
    dojoHtml,
    dojoEvent,
    on
) {
    "use strict";

    return declare("WebCamera.widget.WebCamera", [_WidgetBase], {
        widgetBase: null,
        // Internal variables.
        _handles: null,
        _contextObj: null,
        _mediaStreamTrack: {},
        _imageCapture: null,
        _initialOverflow: "",

        MODES: {
            INIT_MODE: "INIT_MODE",
            CAPTURING_MODE: "CAPTURING_MODE",
            LOADING_MODE: "LOADING",
            VIEW_MODE: "VIEW_MODE",
            ERROR_MODE: "ERROR_MODE"
        },
        jsCSS: {
            cameraRootElement: {
                alignItems: "center",
                backgroundColor: "#000000",
                display: "flex",
                height: "100vh",
                justifyContent: "center",
                left: "0",
                position: "absolute",
                overflow: "auto",
                top: "0",
                width: "100vw",
                zIndex: "90"
            },
            cameraLoadingElement: {
                style: {
                    height: "100px",
                    margin: "0",
                    padding: "0",
                    width: "100px"
                },
                src: "/widgets/WebCamera/widget/icons/spinner.svg"
            },
            cameraCaptureElement: {
                cameraCaptureElementRoot: {
                    maxHeight: "100vh"
                },
                cameraCaptureElementWrapper: {
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    marginTop: "-40px"
                },
                captureActionBar: {
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    height: "40px",
                    justifyContent: "space-between",
                    left: "0",
                    position: "relative",
                    top: "40px",
                    width: document.body.clientWidth + "px",
                    zIndex: "91"
                },
                captureScreen: {
                    width: "auto",
                    height: "auto",
                    maxWidth: document.body.clientHeight + "px",
                    maxWidth: document.body.clientWidth + "px",
                    margin: 0,
                    padding: 0
                },
                captureIcon: {
                    style: {
                        height: "100px",
                        margin: "0",
                        opacity: "0.2",
                        padding: "0",
                        position: "absolute",
                        width: "100px"
                    },
                    src: "/widgets/WebCamera/widget/icons/camera.png"
                },
                closeButton: {
                    style: {
                        cursor: "pointer",
                        height: "15px",
                        margin: "0 10px",
                        width: "15px"
                    },
                    src: "/widgets/WebCamera/widget/icons/close.png"
                },
                saveButton: {
                    cursor: "pointer",
                    height: "30px",
                    margin: "0 10px",
                    width: "30px"
                }
            },
            cameraCapturedImageViewElement: {
                cameraCapturedImageViewElementRoot: {
                    opacity: "1"
                },
                cameraCapturedImageViewElementWrapper: {
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                },
                capturedImageActionBar: {
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    height: "40px",
                    justifyContent: "center",
                    position: "relative",
                    width: "100%"
                },
                capturedImageElement: {
                    display: "block",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "100vh"
                },
                capturedImageViewActionBar: {
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    height: "40px",
                    justifyContent: "space-between",
                    left: "0",
                    position: "relative",
                    top: "40px",
                    width: "100%",
                    zIndex: "91"
                },
                actionsSetLeft: {
                    alignItems: "center",
                    display: "flex"
                },
                closeButton: {
                    style: {
                        cursor: "pointer",
                        height: "15px",
                        margin: "0 10px 0 10px",
                        width: "15px"
                    },
                    src: "/widgets/WebCamera/widget/icons/close.png"
                },
                backButton: {
                    style: {
                        cursor: "pointer",
                        height: "20px",
                        margin: "0 10px 0 10px",
                        width: "20px"
                    },
                    src: "/widgets/WebCamera/widget/icons/back.png"
                },
                actionsSetRight: {
                    alignItems: "center",
                    display: "flex"
                },
                saveButton: {
                    style: {
                        cursor: "pointer",
                        height: "20px",
                        margin: "0 10px",
                        width: "20px"
                    },
                    src: "/widgets/WebCamera/widget/icons/save.png"
                }
            },
            cameraErrorElement: {
                cameraErrorElementRoot: {},
                cameraErrorElementWrapper: {},
                feedbackMessage: {
                    color: "#fff"
                },
                closeLink: {
                    color: "#fff",
                    cursor: "pointer",
                    display: "block",
                    margin: "15px",
                    textAlign: "center",
                    width: "100%"
                }
            }
        },
        state: {
            nodes: {
                cameraRootElement: null,
                cameraCaptureElement: {
                    cameraCaptureElementRoot: null,
                    cameraCaptureElementWrapper: null,
                    captureScreen: null,
                    captureActionBar: null,
                    captureIcon: null,
                    closeButton: null
                },
                cameraCapturedImageViewElement: {
                    cameraCapturedImageViewElementRoot: null,
                    cameraCapturedImageViewElementWrapper: null,
                    capturedImageViewActionBar: null,
                    actionsSetLeft: null,
                    closeButton: null,
                    backButton: null,
                    saveButton: null,
                    actionsSetRight: null,
                    actionsSetRight: null,
                    capturedImageElement: null
                }
            },
            metaData: {
                isMobile: false
            },
            uiData: {
                previousMode: "",
                currentMode: "",
                screenAspectRatio:
                    document.body.clientWidth / document.body.clientHeight,
                streamAspectRatio: 1,
                captureScreen: null,
                captureActionBar: null,
                currentListeners: [],
                cameraCloseOpenAnimDuration: 1500,
                capturedImageCanvas: null
            },
            media: {
                stream: null,
                imageCaptureHandler: null,
                captureImage: null
            }
        },

        constructor: function() {
            this._handles = [];
            this.setInitialState();
        },
        postCreate: function() {
            logger.debug(this.id + ".postCreate");
        },
        getVideoStream: function() {
            return navigator.mediaDevices.getUserMedia(
                this.state.metaData.requestedMediaStream
            );
        },
        handleVideoStream: function(stream) {
            if (stream) {
                this.state.media.stream = stream;
                this.setNextMode(this.MODES.CAPTURING_MODE, {
                    mediaStream: stream
                });
            } else {
                console.warn("no stream detected!");
            }
        },

        getImageDataURL: function(imageBitmap) {
            var imageCanvas = dojoConstruct.create("canvas");
            imageCanvas.width = imageBitmap.width;
            imageCanvas.height = imageBitmap.height;
            imageCanvas
                .getContext("2d")
                .clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCanvas.getContext("2d").drawImage(imageBitmap, 0, 0);
            this.setCapturedImageCanvas(imageCanvas);
            var imageQuality =
                parseInt(this.qualityEnum.replace("n", ""), 10) / 10;
            return imageCanvas.toDataURL(
                "image/" + this.formatEnum,
                imageQuality
            );
        },

        setCapturedImageCanvas: function(imageCanvas) {
            this.state.uiData.capturedImageCanvas = imageCanvas;
        },
        getCapturedImageCanvas: function() {
            return this.state.uiData.capturedImageCanvas;
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
            this.refreshState();
            this.refreshStyles();
            this.setStyles(
                this.state.nodes.cameraRootElement,
                this.jsCSS.cameraRootElement
            );
            if (this.state.uiData.currentMode === this.MODES.CAPTURING_MODE) {
                this.resizeCameraCaptureElement();
            }
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
            this.unregisterCurrentListners();
            dojoConstruct.destroy(this.state.nodes.cameraRootElement);
        },

        captureImage: function() {
            logger.debug(this.id + ".captureImage");
            if (this.state.metaData.isMobile) {
                // first convert blob to a ImageBitmap
                this.state.media.imageCaptureHandler
                    .takePhoto()
                    .then(lang.hitch(this.convertBlobToImageBitmap))
                    .then(lang.hitch(this, this.viewImage))
                    .catch(
                        lang.hitch(this, function(error) {
                            var errorMessage =
                                "Error while trying to set image capture handler " +
                                "[" +
                                error.message +
                                "]";
                            this.setNextMode(this.MODES.ERROR_MODE, {
                                errorMessage: errorMessage
                            });
                        })
                    );
            } else {
                this.state.media.imageCaptureHandler
                    .grabFrame()
                    .then(lang.hitch(this, this.viewImage))
                    .catch(
                        lang.hitch(this, function(error) {
                            var errorMessage =
                                "Error while trying to set image capture handler " +
                                "[" +
                                error.message +
                                "]";
                            this.setNextMode(this.MODES.ERROR_MODE, {
                                errorMessage: errorMessage
                            });
                        })
                    );
            }
        },

        saveImage: function(capturedImageNode) {
            logger.debug(this.id + ".saveImage");
            if (capturedImageNode && this._contextObj) {
                var imageQuality =
                    parseInt(this.qualityEnum.replace("n", ""), 10) / 10;
                this.getCapturedImageCanvas().toBlob(
                    lang.hitch(this, function(blob) {
                        var imageName =
                            this.formatEnum === "jpeg"
                                ? Date.now() + "_image.jpg"
                                : Date.now() + "_image." + this.formatEnum;
                        mx.data.saveDocument(
                            this._contextObj,
                            imageName,
                            { width: 180, height: 180 },
                            blob,
                            lang.hitch(this, function() {
                                logger.debug(
                                    this.id +
                                        "Image has been saved successfully."
                                );
                                if(this.onImageSaved){
                                    this._execMf(
                                        this.onImageSaved,
                                        this._contextObj.getGuid(),
                                        null,
                                        true
                                    );
                                }
                            }),
                            lang.hitch(this, function(error) {
                                var errorMessage =
                                    "Error while saving image " +
                                    "[" +
                                    error.message +
                                    "]";
                                this.setNextMode(this.MODES.ERROR_MODE, {
                                    errorMessage: errorMessage
                                });
                            })
                        );
                    }),
                    "image/" + this.formatEnum,
                    imageQuality
                );
            }
        },
        convertBlobToImageBitmap: function(blob) {
            //createImageBitmap(blob).then(lang.hitch(this, this.createImage));
            return createImageBitmap(blob);
        },
        viewImage: function(imageBitmap) {
            var imageSrc = this.getImageDataURL(imageBitmap);
            this.setNextMode(this.MODES.VIEW_MODE, { imageSrc: imageSrc });
        },
        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                this.setStyles(
                    this.state.nodes.cameraRootElement,
                    this.jsCSS.cameraRootElement
                );
                this.setNextMode(this.MODES.LOADING_MODE);
                if (this.isChromeBrowser()) {
                    this.getVideoStream()
                        .then(lang.hitch(this, this.handleVideoStream))
                        .catch(
                            lang.hitch(this, function(error) {
                                var errorMessage =
                                    "Error while trying to get media stream [" +
                                    error.message +
                                    "]";
                                this.setNextMode(this.MODES.ERROR_MODE, {
                                    errorMessage: errorMessage
                                });
                            })
                        );
                } else {
                    var errorMessage =
                        "Please open your App using Google Chrome Web Browser. Camera is in 'beta' mode and more improvements and support will come soon!";
                    this.setNextMode(this.MODES.ERROR_MODE, {
                        errorMessage: errorMessage
                    });
                }
            } else {
                dojoStyle.set(
                    this.state.nodes.cameraRootElement,
                    "display",
                    "none"
                );
            }

            this._executeCallback(callback, "_updateRendering");
        },

        // Shorthand for running a microflow
        _execMf: function(mf, guid, cb,stopCamera) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(
                    mf,
                    {
                        params: {
                            applyto: "selection",
                            guids: [guid]
                        },
                        callback: lang.hitch(this, function(objs) {
                            if (cb && typeof cb === "function") {
                                cb(objs);
                            }
                            if(stopCamera){
                               this.stopCamera(); 
                            }
                        }),
                        error: function(error) {
                            console.debug(error.description);
                        }
                    },
                    this
                );
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function(cb, from) {
            logger.debug(
                this.id + "._executeCallback" + (from ? " from " + from : "")
            );
            if (cb && typeof cb === "function") {
                cb();
            }
        },
        /**** Utils Functions  ****/
        setStyles: function(targetNode, stylesObj) {
            var stylesKeys = Object.keys(stylesObj);
            var stylesLength = stylesKeys.length;
            for (var i = 0; i < stylesLength; i += 1) {
                dojoStyle.set(
                    targetNode,
                    stylesKeys[i],
                    stylesObj[stylesKeys[i]]
                );
            }
        },
        refreshStyles: function() {
            logger.debug(this.id + ".refreshStyles");
            this.jsCSS.cameraRootElement.height = "100vh";
            this.jsCSS.cameraRootElement.width = "100vw";
        },
        refreshState: function() {
            logger.debug(this.id + ".refreshState");
            this.state.uiData.screenAspectRatio =
                document.body.clientWidth / document.body.clientHeight;
        },

        isMobileDevice: function() {
            var body = document.body;
            var smartDevice = ["profile-phone", "profile-tablet"];
            for (var i = 0; i < smartDevice.length; i += 1) {
                if (body.classList.contains(smartDevice[i])) {
                    return true;
                }
            }
            return false;
        },
        isChromeBrowser: function() {
            var docRoot = document.documentElement || document.body.parentElement;
            var supportedBrowsers = ["dj_chrome"];
            for (var i = 0; i < supportedBrowsers.length; i += 1) {
                if (docRoot.classList.contains(supportedBrowsers[i])) {
                    return true;
                }
            }
            return false;
        },

        setInitialState: function() {
            logger.debug(this.id + ".setInitialState");
            //create root element
            var rootElement = dojoConstruct.create("div", {
                id: this.id + "_WebCamera"
            });
            this.state.nodes.cameraRootElement = rootElement;
            dojoConstruct.place(rootElement, document.body);
            // set meta Data
            this.state.metaData.isMobile = this.isMobileDevice();
            this.isMobileDevice()
                ? (this.state.metaData.requestedMediaStream = {
                      video: {
                          facingMode: { exact: "environment" },
                          width: { ideal: 1920 },
                          height: { ideal: 1080 }
                      }
                  })
                : (this.state.metaData.requestedMediaStream = {
                      video: {
                          width: { ideal: 1920 },
                          height: { ideal: 1080 }
                      }
                  });

            // set UI Data
            this.state.uiData.previousMode = this.MODES.INIT_MODE;
            this.state.uiData.currentMode = this.MODES.INIT_MODE;
        },

        setNextMode: function(nextMode, requiredRenderingData) {
            logger.debug(this.id + ".setNextMode");
            this.state.uiData.previousMode = this.state.uiData.currentModeMode;
            this.state.uiData.currentMode = nextMode;
            switch (nextMode) {
                case this.MODES.INIT_MODE:
                    console.log("next mode is:" + nextMode);
                    this.unregisterCurrentListners();
                    dojoConstruct.empty(this.state.nodes.cameraRootElement);
                    break;
                case this.MODES.LOADING_MODE:
                    console.log("next mode is:" + nextMode);
                    this.unregisterCurrentListners();
                    dojoConstruct.empty(this.state.nodes.cameraRootElement);
                    dojoConstruct.place(
                        this.getCameraLoadingElement(),
                        this.state.nodes.cameraRootElement
                    );
                    break;
                case this.MODES.CAPTURING_MODE:
                    console.log("next mode is:" + nextMode);
                    this.unregisterCurrentListners();
                    dojoConstruct.empty(this.state.nodes.cameraRootElement);
                    var cameraCaptureElement = this.getCameraCaptureElement(
                        requiredRenderingData.mediaStream
                    );
                    this.state.media.stream = requiredRenderingData.mediaStream;
                    this.resizeCameraCaptureElement();
                    dojoStyle.set(cameraCaptureElement, "opacity", "0");
                    dojoConstruct.place(
                        cameraCaptureElement,
                        this.state.nodes.cameraRootElement
                    );
                    fxBase
                        .fadeIn({
                            node: cameraCaptureElement,
                            duration: this.state.uiData
                                .cameraCloseOpenAnimDuration
                        })
                        .play();
                    break;
                case this.MODES.VIEW_MODE:
                    console.log("next mode is:" + nextMode);
                    this.unregisterCurrentListners();
                    dojoConstruct.empty(this.state.nodes.cameraRootElement);
                    var cameraCapturedImageViewElement = this.getCameraCapturedImageViewElement(
                        requiredRenderingData.imageSrc
                    );
                    dojoStyle.set(
                        cameraCapturedImageViewElement,
                        "opacity",
                        "0"
                    );
                    dojoConstruct.place(
                        cameraCapturedImageViewElement,
                        this.state.nodes.cameraRootElement
                    );
                    fxBase
                        .fadeIn({
                            node: cameraCapturedImageViewElement,
                            duration: 500
                        })
                        .play();
                    break;
                case this.MODES.ERROR_MODE:
                    console.log("next mode is:" + nextMode);
                    this.unregisterCurrentListners();
                    dojoConstruct.empty(this.state.nodes.cameraRootElement);
                    var cameraErrorElement = this.getCameraErrorElement(
                        requiredRenderingData.errorMessage
                    );
                    dojoConstruct.place(
                        cameraErrorElement,
                        this.state.nodes.cameraRootElement
                    );
                    break;
                default:
                    this.unregisterCurrentListners();
                    dojoConstruct.empty(this.state.nodes.cameraRootElement);
                    console.error("UNKNOWN <NextMode>:", nextMode);
            }
        },

        getCameraLoadingElement: function() {
            logger.debug(this.id + ".getCameraLoadingElement");
            return dojoConstruct.create("img", {
                style: this.jsCSS.cameraLoadingElement.style,
                src: this.jsCSS.cameraLoadingElement.src
            });
        },
        getCameraCaptureElement: function(mediaStream) {
            logger.debug(this.id + ".getCameraCaptureElement");
            var cameraCaptureElementRoot = dojoConstruct.create("div", {
                style: this.jsCSS.cameraCaptureElement.cameraCaptureElementRoot
            });
            var cameraCaptureElementWrapper = dojoConstruct.create("div", {
                style: this.jsCSS.cameraCaptureElement
                    .cameraCaptureElementWrapper
            });
            var captureActionBar = dojoConstruct.create("div", {
                style: this.jsCSS.cameraCaptureElement.captureActionBar
            });
            var closeButton = dojoConstruct.create("img", {
                style: this.jsCSS.cameraCaptureElement.closeButton.style,
                src: this.jsCSS.cameraCaptureElement.closeButton.src,
                alt: "Close"
            });
            var captureIcon = dojoConstruct.create("img", {
                style: this.jsCSS.cameraCaptureElement.captureIcon.style,
                src: this.jsCSS.cameraCaptureElement.captureIcon.src,
                alt: "Capture"
            });
            var captureScreen = dojoConstruct.create("video", {
                style: this.jsCSS.cameraCaptureElement.captureScreen
            });

            dojoConstruct.place(closeButton, captureActionBar);
            dojoConstruct.place(captureActionBar, cameraCaptureElementWrapper);
            dojoConstruct.place(captureScreen, cameraCaptureElementWrapper);
            dojoConstruct.place(captureIcon, cameraCaptureElementWrapper);
            dojoConstruct.place(
                cameraCaptureElementWrapper,
                cameraCaptureElementRoot
            );

            captureScreen.srcObject = mediaStream;
            captureScreen.onloadedmetadata = lang.hitch(this, function() {
                captureScreen.play();

                // set image capture handler
                if (this.isMobileDevice()) {
                    window.test = mediaStream;
                }
                var mediaTrack;
                mediaStream.getVideoTracks !== undefined
                    ? (mediaTrack = mediaStream.getVideoTracks()[0])
                    : (mediaTrack = getTracks()[0]);
                var mediaTrackSettings = mediaTrack.getSettings();
                // set video stram aspect ratio
                this.state.uiData.streamAspectRatio =
                    mediaTrackSettings.aspectRatio;
                var imageCaptureHandler = new ImageCapture(mediaTrack);
                this.state.media.imageCaptureHandler = imageCaptureHandler;
            });

            // set element events
            var closeActionListener = on(
                closeButton,
                "click",
                lang.hitch(this, function() {
                    var closeAnim = fx.wipeOut({
                        node: cameraCaptureElementRoot,
                        duration: this.state.uiData.cameraCloseOpenAnimDuration
                    });
                    on(
                        closeAnim,
                        "End",
                        lang.hitch(this, function() {
                            // stop camera video stream
                            this.stopCamera();
                            this.mxform.close();
                        })
                    );
                    dojoStyle.set(
                        this.state.nodes.cameraCaptureElement.captureIcon,
                        "display",
                        "none"
                    );
                    closeAnim.play();
                })
            );

            var captureActionListener = on(
                captureScreen,
                "dblclick",
                lang.hitch(this, function(e) {
                    this.captureImage();
                })
            );

            var captureIconActionListener = on(
                captureIcon,
                "dblclick",
                lang.hitch(this, function(e) {
                    this.captureImage();
                })
            );

            // set elements listners
            this.state.uiData.currentListeners.push(closeActionListener);
            this.state.uiData.currentListeners.push(captureActionListener);
            this.state.uiData.currentListeners.push(captureIconActionListener);

            // set elements nodes
            this.state.nodes.cameraCaptureElement.cameraCaptureElementRoot = cameraCaptureElementRoot;
            this.state.nodes.cameraCaptureElement.cameraCaptureElementWrapper = cameraCaptureElementWrapper;
            this.state.nodes.cameraCaptureElement.closeButton = closeButton;
            this.state.nodes.cameraCaptureElement.captureIcon = captureIcon;
            this.state.nodes.cameraCaptureElement.captureScreen = captureScreen;
            this.state.nodes.cameraCaptureElement.captureActionBar = captureActionBar;

            return cameraCaptureElementRoot;
        },

        getCameraCapturedImageViewElement: function(imageSrc) {
            logger.debug(this.id + ".getCameraLoadingElement");
            var cameraCapturedImageViewElementRoot = dojoConstruct.create(
                "div",
                {
                    style: this.jsCSS.cameraCapturedImageViewElement
                        .cameraCapturedImageViewElementRoot
                }
            );
            var cameraCapturedImageViewElementWrapper = dojoConstruct.create(
                "div",
                {
                    style: this.jsCSS.cameraCapturedImageViewElement
                        .cameraCapturedImageViewElementWrapper
                }
            );
            var capturedImageViewActionBar = dojoConstruct.create("div", {
                style: this.jsCSS.cameraCapturedImageViewElement
                    .capturedImageViewActionBar
            });
            var actionsSetLeft = dojoConstruct.create("div", {
                style: this.jsCSS.cameraCapturedImageViewElement.actionsSetLeft
            });
            var closeButton = dojoConstruct.create("img", {
                style: this.jsCSS.cameraCapturedImageViewElement.closeButton
                    .style,
                src: this.jsCSS.cameraCapturedImageViewElement.closeButton.src,
                alt: "Close"
            });
            var backButton = dojoConstruct.create("img", {
                style: this.jsCSS.cameraCapturedImageViewElement.backButton
                    .style,
                src: this.jsCSS.cameraCapturedImageViewElement.backButton.src,
                alt: "Back"
            });
            var saveButton = dojoConstruct.create("img", {
                style: this.jsCSS.cameraCapturedImageViewElement.saveButton
                    .style,
                src: this.jsCSS.cameraCapturedImageViewElement.saveButton.src,
                alt: "Save"
            });
            var actionsSetRight = dojoConstruct.create("div", {
                style: this.jsCSS.cameraCapturedImageViewElement.actionsSetRight
            });
            var capturedImageElement = dojoConstruct.create("img", {
                style: this.jsCSS.cameraCapturedImageViewElement
                    .capturedImageElement,
                src: imageSrc
            });

            dojoConstruct.place(closeButton, actionsSetLeft);
            dojoConstruct.place(backButton, actionsSetLeft);
            dojoConstruct.place(actionsSetLeft, capturedImageViewActionBar);
            dojoConstruct.place(saveButton, actionsSetRight);
            dojoConstruct.place(actionsSetRight, capturedImageViewActionBar);
            dojoConstruct.place(
                capturedImageViewActionBar,
                cameraCapturedImageViewElementWrapper
            );
            dojoConstruct.place(
                capturedImageElement,
                cameraCapturedImageViewElementWrapper
            );
            dojoConstruct.place(
                cameraCapturedImageViewElementWrapper,
                cameraCapturedImageViewElementRoot
            );

            // set event listeners
            var closeActionListener = on(
                closeButton,
                "click",
                lang.hitch(this, function() {
                    var closeAnim = fx.wipeOut({
                        node: cameraCapturedImageViewElementRoot,
                        duration: this.state.uiData.cameraCloseOpenAnimDuration
                    });
                    on(
                        closeAnim,
                        "End",
                        lang.hitch(this, function() {
                            // stop camera video stream
                            this.stopCamera();
                            this.mxform.close();
                        })
                    );
                    closeAnim.play();
                })
            );
            var backActionListener = on(
                backButton,
                "click",
                lang.hitch(this, function() {
                    var backAnim = fxBase.fadeOut({
                        node: cameraCapturedImageViewElementRoot,
                        duration: 500
                    });
                    on(
                        backAnim,
                        "End",
                        lang.hitch(this, function() {
                            this.setNextMode(this.MODES.CAPTURING_MODE, {
                                mediaStream: this.state.media.stream
                            });
                        })
                    );
                    backAnim.play();
                })
            );
            var saveActionListener = on(
                saveButton,
                "click",
                lang.hitch(this, function() {
                    this.saveImage(capturedImageElement);
                })
            );

            this.state.uiData.currentListeners.push(closeActionListener);
            this.state.uiData.currentListeners.push(backActionListener);
            this.state.uiData.currentListeners.push(saveActionListener);

            // set nodes
            this.state.nodes.cameraCapturedImageViewElement.cameraCapturedImageViewElementRoot = cameraCapturedImageViewElementRoot;
            this.state.nodes.cameraCapturedImageViewElement.cameraCapturedImageViewElementWrapper = cameraCapturedImageViewElementWrapper;
            this.state.nodes.cameraCapturedImageViewElement.capturedImageViewActionBar = capturedImageViewActionBar;
            this.state.nodes.cameraCapturedImageViewElement.actionsSetLeft = actionsSetLeft;
            this.state.nodes.cameraCapturedImageViewElement.closeButton = closeButton;
            this.state.nodes.cameraCapturedImageViewElement.backButton = backButton;
            this.state.nodes.cameraCapturedImageViewElement.saveButton = saveButton;
            this.state.nodes.cameraCapturedImageViewElement.actionsSetRight = actionsSetRight;
            this.state.nodes.cameraCapturedImageViewElement.capturedImageElement = capturedImageElement;

            return cameraCapturedImageViewElementRoot;
        },

        getCameraErrorElement: function(errorMessage) {
            var cameraErrorElementRoot = dojoConstruct.create("div", {
                style: this.jsCSS.cameraErrorElement.cameraErrorElementRoot
            });
            var cameraErrorElementWrapper = dojoConstruct.create("div", {
                style: this.jsCSS.cameraErrorElement.cameraErrorElementWrapper
            });
            var feedbackMessage = dojoConstruct.create("p", {
                style: this.jsCSS.cameraErrorElement.feedbackMessage
            });
            var closeLink = dojoConstruct.create("a", {
                style: this.jsCSS.cameraErrorElement.closeLink
            });

            feedbackMessage.innerText = errorMessage;
            closeLink.innerText = "Close";

            dojoConstruct.place(feedbackMessage, cameraErrorElementWrapper);
            dojoConstruct.place(closeLink, cameraErrorElementWrapper);
            dojoConstruct.place(
                cameraErrorElementWrapper,
                cameraErrorElementRoot
            );

            var closeLinkAction = on(
                closeLink,
                "click",
                lang.hitch(this, function(e) {
                    this.mxform.close();
                })
            );

            this.state.uiData.currentListeners.push(closeLinkAction);

            return cameraErrorElementRoot;
        },

        resizeCameraCaptureElement: function() {
            logger.debug(this.id + ".resizeCameraCaptureElement");

            var actualWidth = document.body.clientWidth;
            var videoWidth =
                this.state.nodes.cameraCaptureElement.captureScreen
                    .videoWidth || actualWidth;

            if (videoWidth > actualWidth) {
                dojoStyle.set(
                    this.state.nodes.cameraCaptureElement.captureScreen,
                    "width",
                    actualWidth + "px"
                );
                dojoStyle.set(
                    this.state.nodes.cameraCaptureElement.captureActionBar,
                    "width",
                    "100%"
                );
            } else {
                dojoStyle.set(
                    this.state.nodes.cameraCaptureElement.captureScreen,
                    "width",
                    "auto"
                );
                dojoStyle.set(
                    this.state.nodes.cameraCaptureElement.captureActionBar,
                    "width",
                    "100%"
                );
            }
        },

        unregisterCurrentListners: function() {
            logger.debug(this.id + ".unregisterCurrentListners");
            var listeners = this.state.uiData.currentListeners;
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].remove();
            }
            this.state.uiData.currentListeners = [];
        },

        stopCamera: function() {
            var tracks = this.state.media.stream.getTracks();
            for (var i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
            this.state.nodes.cameraCaptureElement.captureScreen.srcObject = null;
        }
    });
});

require(["WebCamera/widget/WebCamera"]);
