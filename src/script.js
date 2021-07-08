import './style.css'
import './js/3d/Const/EventConst.js'
import './js/3d/Const/CustomConst.js'
import Application from './js/3d/Application.js'

window.Application = new Application({
    canvas: document.querySelector('canvas.webgl')
})