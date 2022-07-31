//General constants
var scale = document.getElementById('scale').clientWidth / 2;
var initialCanvasHeight = document.getElementById('canvas').clientHeight;
var canvasHeight = document.getElementById('canvas').clientHeight;
var canvasWidth = document.getElementById('canvas').clientWidth;
var pageCount = 1;

//Hide user text input
document.getElementById('user-text-dialog').style.display = 'none';
//Hide village name text input
document.getElementById('village-name-dialog').style.display = 'none';

var mode = 'draw';
var downKey = '';
var curLength = '';
var curDirection = '';
var curPoint = new Point(38.46, 38.46);
var paths = [];
var floors = [];
var selPathPoint1 = null;
var selPathPoint2 = null;
var selectedSegmentIndex = null;
var totalArea = 0;
var intermediatePoints = [];
var selectedFloorIndex = null;
var selectedPointText = null;
var cursorLocation = new Point(0, 0);
var currentText = '';

var gridLayer = new Layer();
var pathsLayer = new Layer();
var floorsLayer = new Layer();
var currentPointLayer = new Layer();
var textLayer = new Layer();
var intermediatePointsLayer = new Layer();

//Disable scrolling using arrow keys
window.addEventListener("keydown", function (e) {
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        if (mode == 'draw')
            e.preventDefault();
    }
}, false);

//Add page button
var addPageButton = document.getElementById('add-page-button');
addPageButton.addEventListener("click", function (e) {
    var newHeight = canvasHeight + (canvasHeight / pageCount);
    canvasHeight = newHeight;
    paper.view.viewSize.height = newHeight;
    document.getElementById('canvas').style.height = newHeight + 'px';
    pageCount++;
    drawGridPoints();
    addPageButton.blur();
}, false);

//Delete segment button
var deleteButton = document.getElementById('delete-button');
deleteButton.addEventListener("click", function (e) {
    if (selectedSegmentIndex != null) {
        paths.splice(selectedSegmentIndex, 1);
        selectedSegmentIndex = null;
        drawPaths();
        findIntermediatePoints();
    }

    if (selectedPointText != null) {
        selectedPointText.remove();
        selectedPointText = null;
    }

    if (selectedFloorIndex != null) {
        floors.splice(selectedFloorIndex, 1);
        selectedFloorIndex = null;
        drawFloors();
    }

    deleteButton.blur();
}, false);

//Convert segment button
var convertSegmentButton = document.getElementById('convert-segment-button');
convertSegmentButton.addEventListener("click", function (e) {
    if (selectedSegmentIndex != null) {
        paths[selectedSegmentIndex].type = paths[selectedSegmentIndex].type == 'dotted' ? 'solid' : 'dotted';
        drawPaths();
    }
    convertSegmentButton.blur();
}, false);

//Clear canvas button
var clearCanvasButton = document.getElementById('clear-canvas-button');
clearCanvasButton.addEventListener("click", function (e) {
    downKey = '';
    curLength = '';
    curDirection = '';
    curPoint = new Point(38.46, 38.46);
    paths = [];
    floors = [];
    selPathPoint1 = null;
    selPathPoint2 = null;
    selectedSegmentIndex = null;
    totalArea = 0;

    // curPointText = null;
    selectedPointText = null;
    cursorLocation = new Point(0, 0);
    currentText = '';

    gridLayer.removeChildren();
    pathsLayer.removeChildren();
    floorsLayer.removeChildren();
    currentPointLayer.removeChildren();
    textLayer.removeChildren();

    drawGridPoints();
    drawCurrentPoint();
    clearCanvasButton.blur();
}, false);

//Clear canvas button
var saveFloorButton = document.getElementById('save-floor-button');
saveFloorButton.addEventListener("click", function (e) {
    finishFloor();
    saveFloorButton.blur();
}, false);

//Type button
var typeButton = document.getElementById('type-button');
typeButton.addEventListener("click", function (e) {
    typeButton.blur();
    if (document.getElementById('user-text-dialog').style.display == 'none') {
        mode = 'text';
        document.getElementById('user-text-dialog').style.display = 'block';
        document.getElementById('user-text-input').value = '';
        document.getElementById('user-text-input').focus();
    } else {
        mode = 'draw';
        document.getElementById('user-text-dialog').style.display = 'none';
    }
}, false);

//Settings button
var settingsButton = document.getElementById('settings-button');
settingsButton.addEventListener("click", function (e) {
    settingsButton.blur();
    if (document.getElementById('village-name-dialog').style.display == 'none') {
        document.getElementById('village-name-dialog').style.display = 'block';
        document.getElementById('village-name-input').focus();
    } else {
        document.getElementById('village-name-dialog').style.display = 'none';
    }
}, false);
var villageNameInput = document.getElementById('village-name-input');
villageNameInput.addEventListener("input", function (e) {
    document.getElementById('village-name').innerText = villageNameInput.value;
}, false);
var talukNameInput = document.getElementById('taluk-name-input');
talukNameInput.addEventListener("input", function (e) {
    document.getElementById('taluk-name').innerText = talukNameInput.value;
}, false);
var districtNameInput = document.getElementById('district-name-input');
districtNameInput.addEventListener("input", function (e) {
    document.getElementById('taluk-name').innerText = districtNameInput.value;
}, false);

//Print button
var printButton = document.getElementById('print-button');
printButton.addEventListener("click", function (e) {
    preparePrint();
    printButton.blur();
}, false);

//Draw initial stuff
drawGridPoints();
drawCurrentPoint();

//Mouse down event
function onMouseDown(event) {
    if (mode == 'text') {
        cursorLocation = event.point;
        currentText = document.getElementById('user-text-input').value;
        document.getElementById('user-text-dialog').style.display = 'none';
        typeText();
    } else if (paths.length == 0 && downKey == 16) {
        curPoint = event.point;
        drawCurrentPoint();
    } else {
        floorsLayer.getItems({recursive: false}).map(function (floor) {
            if (floor.contains(event.point)) {
                floor.selected = true;
                selectedFloorIndex = floors.indexOf(floor);
            } else {
                floor.selected = false;
            }
        });
    }
}

function onMouseUp(event) {

}

//Key down event
function onKeyDown(event) {
    downKey = event.event.keyCode;
}

//Key up event
function onKeyUp(event) {
    downKey = '';
    if (mode == 'draw') {
        var keyCode = event.event.keyCode;
        if ((keyCode >= 96 && keyCode <= 105) || (keyCode >= 48 && keyCode <= 57) || keyCode == 110 || keyCode == 190) {
            curLength = curLength + event.event.key;
        } else if ((keyCode >= 37 && keyCode <= 40) && curLength != '') {
            curDirection = keyCode;
            curLength = parseFloat(curLength) * scale;
            calcPath();
        } else if (keyCode == 13) {
            finishPath();
        }
    } else if (mode == 'text') {

    }
}

//Check if the point is inside canvas
function insideCanvas(point) {
    return !(point.x < 0 || point.x > canvasWidth || point.y < 0 || point.y > canvasHeight);
}

//Calculate the point where the line ends
function calcPath() {
    var prevPoint = null;
    var newPoint = null;

    switch (parseInt(curDirection)) {
        case 37:
            newPoint = curPoint - [parseFloat(curLength), 0];
            break;
        case 38:
            newPoint = curPoint - [0, parseFloat(curLength)];
            break;
        case 39:
            newPoint = curPoint + [parseFloat(curLength), 0];
            break;
        case 40:
            newPoint = curPoint + [0, parseFloat(curLength)];
            break;
    }

    if (insideCanvas(newPoint) && curPoint != newPoint) {
        prevPoint = curPoint;
        curPoint = newPoint;
        paths.push({start: prevPoint, end: curPoint, type: 'solid'});
        drawPaths();
        drawCurrentPoint();

        findIntermediatePoints();
    } else {
        console.log("Invalid length");
    }

    curLength = '';
    curDirection = '';
}

//Find intermediate points
function findIntermediatePoints() {
    intermediatePoints = [];

    for (var i = 0; i < paths.length; i++) {
        for (var j = 0; j < paths.length; j++) {
            if ((paths[i].start.x > paths[j].start.x && paths[i].start.x < paths[j].end.x) ||
                (paths[i].start.x < paths[j].start.x && paths[i].start.x > paths[j].end.x)) {
                var tempPoint = new Point(paths[i].start.x, paths[j].start.y);
                if (!intermediatePointExists(tempPoint))
                    intermediatePoints.push(tempPoint);
            }

            if ((paths[i].start.y > paths[j].start.y && paths[i].start.y < paths[j].end.y) ||
                (paths[i].start.y < paths[j].start.y && paths[i].start.y > paths[j].end.y)) {
                var tempPoint = new Point(paths[j].start.x, paths[i].start.y);
                if (!intermediatePointExists(tempPoint))
                    intermediatePoints.push(tempPoint);
            }
        }
    }
    drawIntermediatePoints();
}

//Check if an intermediate point exists and insert
function intermediatePointExists(point) {
    for (var i = 0; i < intermediatePoints.length; i++) {
        if (point == intermediatePoints[i])
            return true;
    }

    for (var j = 0; j < paths.length; j++) {
        if (point == paths[i].start || point == paths[i].end)
            return true;
    }

    return false;
}

//Draw intermediate points
function drawIntermediatePoints() {
    intermediatePointsLayer.activate();
    intermediatePointsLayer.removeChildren();

    intermediatePoints.map(function (point) {
        var intermediatePoint = new Path.Circle({
            center: point,
            radius: 5,
            strokeColor: '#000',
            fillColor: selPathPoint1 == point ? '#FF0000' : selPathPoint2 == point ? '#00FF00' : '#0000FF'
        });

        intermediatePoint.onMouseDown = function (event) {
            if (downKey == 17) {
                curPoint = this.interiorPoint;
                drawCurrentPoint();
            } else {
                selectIntermediatePoint(this.interiorPoint);
            }
        };
    });
}

//Select an intermediate point
function selectIntermediatePoint(point) {
    if (selPathPoint1 != null && selPathPoint2 != null) {
        selPathPoint1 = null;
        selPathPoint2 = null;
        drawPaths();
        drawIntermediatePoints();
    } else {
        for (var i = 0; i < intermediatePoints.length; i++) {
            var curSelection = point == intermediatePoints[i] ? intermediatePoints[i] : null;
            if (curSelection) {
                if (selPathPoint1 == null) {
                    selPathPoint1 = curSelection;
                } else if (selPathPoint2 == null && (selPathPoint1 != selPathPoint2)) {
                    selPathPoint2 = curSelection;
                    var segment = {start: selPathPoint1, end: selPathPoint2, type: 'dotted'};
                    var segmentExists = false;

                    //Check if the segment is already a path
                    for (var j = 0; j < paths.length; j++) {
                        if ((paths[j].start == segment.start && paths[j].end == segment.end) ||
                            (paths[j].start == segment.end && paths[j].end == segment.start)) {
                            segmentExists = true;
                            console.log("There is a path here");
                            break;
                        }
                    }

                    if (!segmentExists) {
                        paths.push(segment);
                    }
                }
                drawPaths();
                findIntermediatePoints();
                break;
            }
        }
    }
}

//Draw reference grid points
function drawGridPoints() {
    gridLayer.activate();
    gridLayer.removeChildren();

    var pageHeight = (initialCanvasHeight / scale).toFixed(0);
    var w = (canvasWidth / scale).toFixed(0);
    var h = (canvasHeight / scale).toFixed(0);

    for (var i = 1; i < w; i++) {
        for (var j = 1; j < h; j++) {
            var isBorder = (j % pageHeight == 1 && j > 1);
            var gridPoint = new Path.Circle({
                center: new Point(i * scale, j * scale),
                radius: isBorder ? 1 : 0.1,
                strokeColor: isBorder ? '#FF0000' : '#CCC',
                fillColor: '#FF0000'
            });
        }
    }
}

//Draw current cursor point
function drawCurrentPoint() {
    currentPointLayer.activate();
    currentPointLayer.removeChildren();

    var myCircle = new Path.Circle({
        center: curPoint,
        radius: 8
    });
    myCircle.dashArray = [3, 3];
    myCircle.strokeColor = '#000';
}

//Draw all paths using paths array
function drawPaths() {
    pathsLayer.activate();
    pathsLayer.removeChildren();

    paths.map(function (segment) {
        var path = new Path([segment.start, segment.end]);
        if (segment.type == 'dotted')
            path.dashArray = [5, 5];
        path.strokeCap = 'round';
        path.strokeWidth = segment.hover ? 6 : 3;
        path.strokeColor = segment.selected ? '#000' : segment.hover ? '#555' : '#999';

        drawLength(segment.start, segment.end);
        drawEndPoints(segment.start, segment.end);

        path.onMouseDown = function (event) {
            selectPath(this);
        };

        path.onMouseEnter = function (event) {
            mouseOverPath(this);
        };

        path.onMouseLeave = function (event) {
            mouseLeavePath();
        };
    });
}

//Draw endpoints of a segment
function drawEndPoints(start, end) {
    var start = new Path.Circle({
        center: start,
        radius: 5,
        strokeColor: '#000',
        fillColor: selPathPoint1 == start ? '#FF0000' : selPathPoint2 == start ? '#00FF00' : '#0000FF'
    });

    var end = new Path.Circle({
        center: end,
        radius: 5,
        strokeColor: '#000',
        fillColor: selPathPoint1 == end ? '#FF0000' : selPathPoint2 == end ? '#00FF00' : '#0000FF'
    });


    start.onMouseDown = function (event) {
        if (downKey == 17) {
            curPoint = this.interiorPoint;
            drawCurrentPoint();
        } else {
            selectEndPoint(this.interiorPoint);
        }
    };

    end.onMouseDown = function (event) {
        if (downKey == 17) {
            curPoint = this.interiorPoint;
            drawCurrentPoint();
        } else {
            selectEndPoint(this.interiorPoint);
        }
    };
}

//User selects an end point
function selectEndPoint(endPoint) {
    if (selPathPoint1 != null && selPathPoint2 != null) {
        selPathPoint1 = null;
        selPathPoint2 = null;
        drawPaths();
    } else {
        for (var i = 0; i < paths.length; i++) {
            var curSelection = endPoint == paths[i].start ? paths[i].start : endPoint == paths[i].end ? paths[i].end : null;
            if (curSelection) {
                if (selPathPoint1 == null) {
                    selPathPoint1 = curSelection;
                } else if (selPathPoint2 == null && (selPathPoint1 != selPathPoint2)) {
                    selPathPoint2 = curSelection;
                    var segment = {start: selPathPoint1, end: selPathPoint2, type: 'dotted'};
                    var segmentExists = false;

                    //Check if the segment is already a path
                    for (var j = 0; j < paths.length; j++) {
                        if ((paths[j].start == segment.start && paths[j].end == segment.end) ||
                            (paths[j].start == segment.end && paths[j].end == segment.start)) {
                            segmentExists = true;
                            console.log("There is a path here");
                            break;
                        }
                    }

                    if (!segmentExists) {
                        paths.push(segment);
                    }
                }
                drawPaths();
                break;
            }
        }
    }
}

//Select a path
function selectPath(path) {
    for (var i = 0; i < paths.length; i++) {
        if (paths[i].start.x == path.segments[0].point.x &&
            paths[i].start.y == path.segments[0].point.y &&
            paths[i].end.x == path.segments[1].point.x &&
            paths[i].end.y == path.segments[1].point.y) {

            deselectAll();

            paths[i].selected = true;
            selectedSegmentIndex = i;
        } else {
            paths[i].selected = false;
        }
    }
    drawPaths();
}

//Mouse hover over path
function mouseOverPath(path) {
    for (var i = 0; i < paths.length; i++) {
        if (paths[i].start.x == path.segments[0].point.x &&
            paths[i].start.y == path.segments[0].point.y &&
            paths[i].end.x == path.segments[1].point.x &&
            paths[i].end.y == path.segments[1].point.y) {
            paths[i].hover = true;
        } else {
            paths[i].hover = false;
        }
    }
    drawPaths();
}

//Mouse hover over path
function mouseLeavePath() {
    for (var i = 0; i < paths.length; i++) {
        paths[i].hover = false;
    }
    drawPaths();
}

//Draw length of a line
function drawLength(start, end) {

    var x1 = start.x;
    var y1 = start.y;
    var x2 = end.x;
    var y2 = end.y;
    var m = (y2 - y1) / (x2 - x1);
    var angleDeg = Math.floor(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
    var length = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    var xOffset = 0;
    var yOffset = 0;
    if (angleDeg >= 0 && angleDeg < 90) {
        xOffset = -15;
        yOffset = -5;
    } else if (angleDeg >= 90 && angleDeg < 180) {
        xOffset = 5;
        yOffset = -15;
    } else if (angleDeg >= 180 && angleDeg < 360) {
        xOffset = -15;
        yOffset = 15;
    } else if (angleDeg < 0) {
        xOffset = -5;
        yOffset = 15;
    }

    if (angleDeg >= 180) {
        angleDeg = angleDeg % 180;
    }

    var centerX = (start.x + end.x) / 2;
    var centerY = (start.y + end.y) / 2;

    var text = new PointText(new Point(centerX + xOffset, centerY + yOffset));
    text.fillColor = '#000';
    text.rotation = angleDeg;
    text.content = (length / scale).toFixed(2) + 'm';

    text.onMouseDrag = function (event) {
        if (event.event.buttons == 1)
            this.position += event.delta;
        else if (event.event.buttons == 2)
            this.rotation = text.rotation + event.delta.x * 2;
    }
}

//Complete path from previous point to start point
function finishPath() {
    if (paths.length > 1 && curPoint != paths[0].start) {
        var prevPoint = curPoint;
        curPoint = paths[0].start;
        paths.push({
            start: prevPoint,
            end: paths[0].start
        });

        drawPaths();
        drawCurrentPoint();

        findIntermediatePoints();
    }
}

//Finish existing floor
function finishFloor() {
    var floor = {
        paths: paths
    };

    floors.push(floor);
    drawFloors();

    curPoint = new Point(19.23, 19.23);
    drawCurrentPoint();

    intermediatePoints = [];
    drawIntermediatePoints();

    downKey = '';
    curLength = '';
    curDirection = '';
    curPoint = new Point(19.23, 19.23);
    paths = [];
    selPathPoint1 = null;
    selPathPoint2 = null;
    selectedSegmentIndex = null;
}

//Draw floors
function drawFloors() {
    totalArea = 0;
    floorsLayer.activate();
    floorsLayer.removeChildren();
    pathsLayer.removeChildren();

    if (floors.length == 0) {
        document.getElementById('q4').value = '';
        document.getElementById('q4-text').innerText = '';
    } else {
        floors.map(function (floor) {
            var paths = floor.paths;
            var circumference = new Path({
                strokeWidth: 1,
                strokeColor: '#000'
            });

            paths.map(function (segment) {
                if (segment.type == 'dotted') {
                    var path = new Path([segment.start, segment.end]);
                    path.strokeWidth = 1;
                    path.strokeColor = '#000';
                    path.dashArray = [5, 5];
                } else {
                    circumference.add(segment.start, segment.end);
                }

                drawLength(segment.start, segment.end);
            });

            var area = Math.abs(circumference.area / (scale * scale)).toFixed(2);
            drawFloorArea(area, circumference.bounds.bottomLeft);

            totalArea = parseFloat(totalArea) + parseFloat(area);
            document.getElementById('q4').value = (totalArea).toFixed(2) + ' sq.m';
            document.getElementById('q4-text').innerText = totalArea + ' sq.m';

            // circumference.onClick = function (event) {
            //     deselectAll();
            //     circumference.selected = true;
            //     selectedFloorIndex = floors.indexOf(floor);
            // };
        });
    }
}

//Draw floor area
function drawFloorArea(area, location) {
    var areaText = new PointText(location + new Point(20, 30));
    areaText.fillColor = '#000';
    areaText.content = area + ' sq.m';

    areaText.onMouseDrag = function (event) {
        areaText.position += event.delta;
    };
}

//Typing in text mode
function typeText() {
    textLayer.activate();

    var curPointText = new PointText(cursorLocation);
    curPointText.fillColor = '#000';
    curPointText.content = currentText;

    curPointText.onMouseDrag = function (event) {
        curPointText.position += event.delta;
    };

    curPointText.onClick = function (event) {
        deselectAll();
        curPointText.selected = true;
        selectedPointText = this;
        drawPaths();
    };

    currentText = '';
    mode = 'draw';
}

//Deselect everything
function deselectAll() {
    selectedPointText = null;
    selPathPoint1 = null;
    selPathPoint2 = null;
    selectedSegmentIndex = null;

    textLayer.getItems({recursive: false}).map(function (item) {
        item.selected = false;
    });

    for (var i = 0; i < paths.length; i++) {
        paths[i].selected = false;
    }

    floorsLayer.getItems({recursive: false}).map(function (item) {
        item.selected = false;
    });
}

//Prepare print
function preparePrint() {
    gridLayer.removeChildren();
    currentPointLayer.removeChildren();
    intermediatePointsLayer.removeChildren();

    setTimeout(print, 1000);
}

//Print
function print() {
    window.print();
}