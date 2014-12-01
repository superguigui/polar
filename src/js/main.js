var webgl, gui, painter, stats, audio;

document.addEventListener('DOMContentLoaded', init);

function init(){

    // gui = new dat.GUI({width: 400});
    // gui.close();
    
    painter = new Painter(window.innerWidth, window.innerHeight);

    webgl = new Webgl(window.innerWidth, window.innerHeight, painter.canvas, document.querySelector('.three'));
    // document.querySelector('.painter-debug').appendChild(painter.canvas);

    audio = new Audio();

    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.left = '0px';
    // stats.domElement.style.top = '0px';
    // document.body.appendChild( stats.domElement );

    window.onresize = resizeHandler;

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('touchstart', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);

    var button = document.querySelector('.invert-button');

    button.addEventListener('click', webgl.tunnelTransition.bind(webgl));

    animate();

    painter.startIntro();
}

function onKeyUp(e) {
    if(e.keyCode === 32) {
        webgl.tunnelTransition();
    }
}

function onMouseUp(e) {
    if(webgl.enablePainter)
        painter.mouseUp(e);
}

function onMouseDown(e) {
    if(webgl.enablePainter)
        painter.mouseDown(e);
}

function onMouseMove(e) {
    if(webgl.enablePainter)
        painter.mouseMove(e);
}

function onTouchMove(e) {
    if(webgl.enablePainter)
        painter.mouseMove(e.targetTouches[0]);
}

function resizeHandler() {
    webgl.resize(window.innerWidth, window.innerHeight);
    painter.resize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    audio.update();
    // stats.begin();
    if(webgl.enablePainter)
        painter.render(webgl.clock.elapsedTime);    
    webgl.render();
    // stats.end();
}