BindingStatementHeader = [
]


BindingStatementBody = [
    {
        w: 1, //set weight
        v: function(dr, arr={}) {
            var node = getRandomObjectType("Node");
            var nodechild = getRandomObjectType("Node");
            if (node == -1) return getAStatement(dr, arr);
            var stm = cat([node,".appendChild(", nodechild, ");"], 1);
            return stm
        }
    },
    {
        w: 1,
        v: function(dr, arr={}) {
            var node = getRandomObjectType("Node");
            var nodechild = getRandomObjectType("Node");
            if (node == -1) return getAStatement(dr, arr);
            var stm = cat([node,".removeChild(", nodechild, ");"], 1);
            return stm
        }
    },
    {
        w: 1,
        v: function(dr, arr={}) {
            var node = getRandomObjectType("Node");
            if (node == -1) return getAStatement(dr, arr);
            var stm = cat([node,".cloneNode(", getRandomObjectType("boolean"),");"], 0);
            processReturnData(stm, "Node")
            return stm
        }
    },
    {
        // hook alert() => gc() 
        //check this https://github.com/favocado/webkitgtk-fuzz/blob/master/patches/patch-2.28.3.diff#L18
        w: 2,
        v: function(dr, arr={}) {
            return "alert();";
        }
    }
]

ListSubTypes = {}
ListSubTypes['style'] = {'CSS_property':'value'}
ListSubTypes['CanvasContextCreationAttributesModule'] = {"alpha":"boolean","willReadFrequently":"boolean","storage":"DOMString", "alpha":"boolean","antialias":"boolean", "failIfMajorPerformanceCaveat":"boolean","powerPreference":"PowerPreference","premultipliedAlpha":"boolean", "preserveDrawingBuffer":"boolean", "stencil":"boolean"}
ListSubTypes['ScrollToOptions'] = {"left":"Int", "top":"Int","behavior":"scroll-behavior"}
ListSubTypes['FocusOptions'] = {"preventScroll":"boolean"}
ListSubTypes['HitRegionOptions'] = {"path":"Path2D","fillRule":"CanvasFillRule", "id": "String", 'control': 'Element'}
ListSubTypes['GetRootNodeOptions'] = {"composed":"boolean"}
ListSubTypes['FullscreenOptions'] = {"navigationUI":"NavigationUI"}
ListSubTypes['ScrollIntoViewOptions'] = {"alignToTop":"boolean", "behavior":"scroll-behavior", "block":"ScrollAlignment", "inline":"ScrollInline"}
ListSubTypes['ShadowRootInit'] = {'mode':"shadowRootInitMode", "delegatesFocus":"boolean"}
ListSubTypes['MediaStreamConstraintsVideo'] = {"width":"Int", "height":"Int", "facingMode": "FacingMode"}
ListSubTypes['MediaStreamConstraints'] = { "audio": "boolean", "video": "MediaStreamConstraintsVideo"  }
ListSubTypes['EventListenerOptions'] = {"capture_optional":"boolean", "once_optional":"boolean", "passive_optional":"boolean", "useCapture_optional":"boolean", "wantsUntrusted_optional":"boolean"  }
ListSubTypes['keyframes'] = {'opacity_optional':'Int', 'easing':"Easing" }
ListSubTypes['AnimateOption'] = {"delay":"Int", "direction":"-webkit-animation-direction","duration":"Int", "endDelay":"Int", "fill":"-webkit-animation-fill-mode"}
ListSubTypes['AudioContextOptions'] = {"latencyHint_optional":"LatencyHint", "sampleRate_optional":"Int-3000-384000" }
ListSubTypes['OfflineAudioContextOptions'] = {"numberOfChannels":"Int-0-32", "length":"Int", "sampleRate":"Int-3000-384000" }
ListSubTypes['pipeToOption'] = {"preventClose_optional":"boolean", "preventAbort_optional":"boolean", "preventCancel_optional":"boolean", "signal_optional":"AbortSignal"}
ListSubTypes['WorkletOptions'] = {"credentials":"WorkletOption"}
ListSubTypes['ImageEncodeOptions'] = {"type":"type", "quality": "Float-0-1"}