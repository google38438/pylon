/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 */


/**
 * Component implementing creating charts
 */

jpf.chart = {
    axis_x_max : null,
    axis_x_min : null,
    axis_y_max : null,
    axis_y_min : null,
    axis_top   : null,
	axis_left  : null,

    area_x : null,
    area_y : null,
    height : null,
    width  : null,
    paddingTop    : 5, /* 10, 5 */
    paddingBottom : 25, /* 30, 25 */
    paddingLeft   : 35, /* 30, 25 */
    paddingRight  : 10, /* 10, 5 */
    defaultColor  : "#97b9d4",

    area : null,
    labels_in_use : [],
    labels_temp : []
}

/**
 * This function prepare chart container. For Firefox create Canvas
 * and insert it into cointainer
 * 
 * @param {htmlElement} htmlElement of Chart area
 * 
 * @return {htmlElement} Chart container, for IE: <div></div>
 *                                        for FF: <div><canvas></canvas></div> 
 */

jpf.chart.createChartArea = function(htmlElement) {
    htmlElement.className = "chartArea";
    jpf.chart.width = htmlElement.offsetWidth - jpf.chart.paddingLeft - jpf.chart.paddingRight - 6;
    jpf.chart.height = htmlElement.offsetHeight - jpf.chart.paddingBottom - jpf.chart.paddingTop - 6;

    if(jpf.isGecko) {
        var canvas = document.createElement("canvas");
	    canvas.setAttribute("width", jpf.chart.width);
	    canvas.setAttribute("height", jpf.chart.height);
	    canvas.className = "canvas";
	    canvas.id = "chart-canvas";
	    htmlElement.appendChild(canvas);
	    htmlElement = canvas.getContext('2d');
	    htmlElement = new jpf.vector.canvas(htmlElement);
				
        
        //htmlElement.save();	
    }
	
    return htmlElement;
}

/**
 * This function creates axes with scale based on data series
 * or (if set) user values
 * 
 * @param {htmlElement} pHtmlElement Chart htmlElement
 * @param {htmlElement} area         Chart htmlElement, for FF Canvas, for IE is useless 
 * @param {Array}       data         max and min values of X and Y
 * @param {Hash Array}  options      some options
 * 
 * @see jpf.chart#calculateRanges
 */

jpf.chart.createAxes = function(pHtmlElement, area, data, options) {
    var axes_values_x = [];
    var axes_values_y = [];

    /* Clearing labels */
    for(var i = 0; i< jpf.chart.labels_in_use.length; i++){
        jpf.chart.labels_in_use[i].style.display = "none";
    }
    jpf.chart.labels_temp = jpf.chart.labels_in_use;
    jpf.chart.labels_in_use = [];	

    var axes = jpf.chart.calculateAxes(data);

    var x_max = jpf.chart.axis_x_max = jpf.chart.axis_x_max ? jpf.chart.axis_x_max : (jpf.chart.axis_x_max == 0 ? 0 : axes.x_max);
    var x_min = jpf.chart.axis_x_min = jpf.chart.axis_x_min ? jpf.chart.axis_x_min : (jpf.chart.axis_x_min == 0 ? 0 : axes.x_min);
    var y_max = jpf.chart.axis_y_max = jpf.chart.axis_y_max ? jpf.chart.axis_y_max : (jpf.chart.axis_y_max == 0 ? 0 : axes.y_max);
    var y_min = jpf.chart.axis_y_min = jpf.chart.axis_y_min ? jpf.chart.axis_y_min : (jpf.chart.axis_y_min == 0 ? 0 : axes.y_min);

    /* If developer sets the proportional = true */
    if(options.proportional){
        x_max = Math.max(Math.abs(x_max), Math.abs(x_min));
        x_min = -x_max;

        y_max = Math.max(Math.abs(y_max), Math.abs(y_min));
        y_min = -y_max; 
    }

    var area_x = jpf.chart.area_x = Math.floor((jpf.chart.width) / 6); 
    var area_y = jpf.chart.area_y = Math.floor((jpf.chart.height) / 6);

    /* Position of axes */
    var x_axis = jpf.chart.axis_left = Math.round((x_min < 0 && x_max >= 0 
                    ? Math.abs(x_min) / (Math.abs(x_min) + x_max)
                    : (x_min < 0 && x_max < 0 
                        ? 1 + Math.abs(x_max) / (Math.abs(x_min) + x_max)
                        : (x_min >= 0 && x_max > 0 
                            ? 0 - x_min / (x_max - x_min)
                            : "x")))*jpf.chart.width);

    var y_axis = jpf.chart.axis_top = Math.round((y_max > 0 && y_min <= 0 
                    ? y_max / (y_max + Math.abs(y_min)) 
                    : (y_max < 0 && y_min < 0 
                        ? 0 - Math.abs(y_max) / (Math.abs(y_min) + y_max) 
                        : 1 + y_min / (y_max - y_min)))*jpf.chart.height);

    var y_axis2 = jpf.chart.height - y_axis;
    var x_axis2 = jpf.chart.width - x_axis;

    /* area before display first line */
    var counter = 0;
    //var temp = Math.floor(area_y*counter + (y_axis >= 0 ? y_axis : y_axis2) % area_y);	
		
	/* Rememebr about changing second part of this temp in the end of second if */
	var temp = Math.floor(y_axis >=0 ? area_y*counter + y_axis%area_y : area_y*counter );

    if(jpf.isGecko) {
        for(var i = 0; i <= jpf.chart.height; i++) {
            if(i == temp) {
                //alert(counter+" "+temp+" "+area_y+" "+y_axis)
				area.beginPath();
                area.changeStartPoint(0, temp);
                area.setLineColor("#ebebeb");
                area.setLineWidth(1);
                area.createLine(jpf.chart.width, temp);
                area.stroke();

                var temp2 =  (y_max > 0 && Math.floor(y_axis / area_y) == 0
								? counter * y_min / Math.floor(y_axis2 / area_y)
								: (y_max > 0
	                                 ? y_max - counter * (y_max / Math.floor(y_axis / area_y))
									 : y_max - counter * (Math.abs(y_min) /Math.floor(y_axis2 / area_y))))
                                
				
                axes_values_y.push(temp2);

                new jpf.chart.addLabel (
                    pHtmlElement, /* parent */
                    temp2, /* innerHTML */
                    0, /* Left */
                    temp, /* Top */
                    false /* centered */
                );

                counter++;
                //temp = Math.floor(area_y*counter + y_axis % area_y);
				temp = Math.floor(y_axis >=0 ? area_y*counter + y_axis%area_y : area_y*counter );
            }

            if(i == y_axis) {
                area.beginPath();
                area.changeStartPoint(0, y_axis);
                area.setLineColor("#707070");
                area.setLineWidth(2);
                area.createLine(jpf.chart.width, y_axis);
                area.stroke();
            }
        }
        
        /* Area before display first line */
        counter = 0;
        var temp = Math.floor(area_x * counter + (x_axis > 0 ? x_axis : x_axis2) % area_x);
        
        for(var i = 0; i <= jpf.chart.width; i++) {
            if(i == temp) {
                area.beginPath();
                area.changeStartPoint(temp, 0);
                area.setLineColor("#ebebeb");
                area.setLineWidth(1);
                area.createLine(temp, jpf.chart.height);
                area.stroke();
                    
                var temp2 = (x_min < 0 && Math.floor((x_axis || x_axis2) / area_x) == 0 
                                ? counter * x_max / Math.floor(x_axis2 / area_x)
                                : (x_min < 0 
                                    ? x_min + counter * Math.abs(x_min) / Math.floor(x_axis / area_x)
                                    : x_min + counter * x_max / Math.floor(x_axis2 / area_x)
                                )
                            )

                    axes_values_x.push(temp2);

                new jpf.chart.addLabel (
                    pHtmlElement, /* parent */
                    temp2, /* innerHTML */
                    temp + 25, /* Left */
                    jpf.chart.height + 5, /* Top */
                    true /* centered */
                );

                counter++;
                //temp = Math.floor(area_x * counter + x_axis % area_x);
				temp = Math.floor(area_x * counter + (x_axis > 0 ? x_axis : x_axis2) % area_x);
            }

            if(i == x_axis) {
                area.beginPath();
                area.changeStartPoint(x_axis, 0);
                area.setLineColor("#707070");
                area.setLineWidth(2);
                area.createLine(x_axis, jpf.chart.height);
                area.stroke();
            }
        }
    
    area.translate(x_axis, y_axis);
    }
    else {

    }
    return {
        area : area,
        y_max : y_max, y_min : y_min,
        x_max : x_max, x_min : x_min,
        area_x : area_x, area_y : area_y,
        x_axis : x_axis, y_axis : y_axis,
        axes_values_x : axes_values_x, axes_values_y : axes_values_y
    };
}

jpf.chart.addLabel = function(parent, value, left, top, center) {
    var label = jpf.chart.labels_temp.length ? jpf.chart.labels_temp.pop() : document.createElement("span");
    jpf.chart.labels_in_use.push(label);

    label.style.display = "block";
    label.className = "axielabel";
    label.innerHTML = value.toString().length > 5 ? value.toString().substr(0, 5) : value;

    label.style.width = parseInt(label.innerHTML.length) * 4 + "px";
    label.style.left = (center ? left-parseInt(label.style.width) / 2 : left) + "px";
    label.style.top = top + "px";
    parent.appendChild(label);
}

/**
 * Function creates Chart with axes. It's possible to add 
 * more functions on one Chart
 * 
 * @param {htmlElement} htmlElement Chart container
 * @param {Hash Array}  options     axis, title and other captions
 */
jpf.chart.createChart = function(htmlElement, options) {
    this.phtmlElement = htmlElement;
    this.options = options;
    _self = this;

    this.data = [];

    this.x_axis = options.x_axis;
    this.y_axis = options.y_axis;
    this.title  = options.title;

    this.area = new jpf.chart.createChartArea(this.phtmlElement);
	
	/* Adding OnMouseWheel event */
	var zooming = 0;
	this.onScroll = function(delta, event) {
		var area_x = jpf.chart.area_x;
		var area_y = jpf.chart.area_y;
		var x_axis = jpf.chart.axis_left;
		var y_axis = jpf.chart.axis_top;
		var x_axis2 = jpf.chart.width - x_axis;
		var y_axis2 = jpf.chart.height - y_axis;
		var x_max = jpf.chart.axis_x_max;
		var x_min = jpf.chart.axis_x_min;
		var y_max = jpf.chart.axis_y_max;
		var y_min = jpf.chart.axis_y_min;
		
		var positionX = event.screenX - jpf.chart.paddingLeft;
		var positionY = event.screenY - jpf.chart.paddingTop;		
		
		var number_of_min_x_axis = parseInt(x_axis/area_x);
		var number_of_max_x_axis = parseInt((jpf.chart.width - x_axis)/area_x);
		var number_of_min_y_axis = parseInt((jpf.chart.height - y_axis)/area_y);
		var number_of_max_y_axis = parseInt(y_axis/area_y);
		
		var value_per_x_axis = (x_min < 0 ? jpf.chart.axis_x_min/number_of_min_x_axis : jpf.chart.axis_x_max/number_of_max_x_axis);		
		var value_per_y_axis = (y_max > 0 ? jpf.chart.axis_y_max/number_of_max_y_axis : jpf.chart.axis_y_min/number_of_min_y_axis);		
			
		var value_x = (x_min < 0 
						? x_min - ((positionX - x_axis%area_x)/area_x)*value_per_x_axis 
						: (x_min > 0 
							? x_min + (((positionX - x_axis2%area_x)/area_x))*value_per_x_axis
							: ((positionX - x_axis%area_x)/area_x)*value_per_x_axis)
							);
			
		
		
						
		//var value_y = y_max - ((positionY - y_axis%area_y)/area_y)*value_per_y_axis;
		var value_y = (y_max > 0 
						? y_max - ((positionY - y_axis%area_y)/area_y)*value_per_y_axis
						: (y_max < 0 
							? y_max + ((positionY - y_axis2%area_y)/area_y)*value_per_y_axis
							: ((positionY - y_axis%area_y)/area_y)*value_per_y_axis
						)
					)
		
		
		
	    x_max = Math.max(Math.abs(x_max), Math.abs(x_min));
	    x_min = -x_max;    
	    
		
		if (delta < 0){		
			
			var _x1 = x_min + Math.abs(value_per_x_axis);
			var _x2 = x_max - Math.abs(value_per_x_axis);
			var _y1 = x_min + Math.abs(value_per_x_axis);
			var _y2 = x_max - Math.abs(value_per_x_axis);			
		}			
		else{			
			var _x1 = x_min - Math.abs(value_per_x_axis);
			var _x2 = x_max + Math.abs(value_per_x_axis);
			var _y1 = x_min - Math.abs(value_per_x_axis);
			var _y2 = x_max + Math.abs(value_per_x_axis);
			
		}
		
		jpf.status("Range: "+"x("+_x1+", "+_x2+") y("+_y1+", "+_y2+")");
		
		
	
		
		if (delta < 0){
			if(Math.abs(value_per_x_axis) > 0.04){
				_self.zoom(_x1, _x2, _y1, _y2);
			}
			else{
				alert("Min zoom reached");
			}
		}		
        else{
			_self.zoom(_x1, _x2, _y1, _y2);
		}
		
		
				
		
		
		
	}
		
	this.wheelEvent = function(event){
		var delta = 0;
		if(!event) {
			event = window.event;
		} 
		if(event.wheelDelta) {
			delta = event.wheelDelta/120; 
			if (window.opera){
				delta = -delta;
			} 
		} 
		else if(event.detail) {
			delta = -event.detail/3;
		}
		if(delta){
			_self.onScroll(delta, event);
		}		
	    if(event.preventDefault){
			event.preventDefault();
		}	               
	    event.returnValue = false;
	}
	
	if (this.area.ctx.canvas.addEventListener)
		this.area.ctx.canvas.addEventListener('DOMMouseScroll', _self.wheelEvent, false);	
	this.area.ctx.canvas.onmousewheel = _self.wheelEvent;

    if(options.axis_x_max || options.axis_x_max == 0)
        jpf.chart.axis_x_max = options.axis_x_max;
    if(options.axis_x_min || options.axis_x_min == 0)
        jpf.chart.axis_x_min = options.axis_x_min;
    if(options.axis_y_max || options.axis_y_max == 0)
        jpf.chart.axis_y_max = options.axis_y_max;
    if(options.axis_y_min || options.axis_y_min == 0)
        jpf.chart.axis_y_min = options.axis_y_min;

    this.addSeries = function(data) {
        this.data.push(data);
    }

    this.drawChart = function() {
        for(var i = 0; i< this.data.length; i++){
            switch(this.data[i].type){
                case "linear":
                    jpf.chart.drawLinearChart(this.area, this.data[i], this.axes);
                break;
            }
        }
    }

    this.clearChartArea = function() {
        this.area.translate(-jpf.chart.axis_left, -jpf.chart.axis_top);
        this.area.clearRect(0, 0, jpf.chart.width, jpf.chart.height);
    }

    this.paint = function() {
        this.axes = jpf.chart.createAxes(this.phtmlElement, this.area, this.data, this.options);
        this.area = this.axes.area;
        _self.drawChart();
    }

    this.zoom = function(x1, x2, y1, y2) {
        _self.clearChartArea();        
		jpf.chart.axis_x_max = parseFloat(x2);
        jpf.chart.axis_x_min = parseFloat(x1);
        jpf.chart.axis_y_max = parseFloat(y2);
        jpf.chart.axis_y_min = parseFloat(y1);
        _self.paint();
    }
}

/**
 * Creates Linear Chart
 * 
 * @param {Canvas}     area  Chart area object (for FF is Canvas)
 * @param {Hash Array} data  Data series and other properties 
 * @param {Hash Array} axes  usefull variables from createAxes() functions
 */

jpf.chart.drawLinearChart = function(area, data, axes) {
    area.setLineColor(data.options.color || jpf.chart.color);
    area.setLineWidth(1);    

    var x_max = Math.abs(axes.x_max);
    var x_min = Math.abs(axes.x_min);
    var y_max = Math.abs(axes.y_max);
    var y_min = Math.abs(axes.y_min);

    var area_value_x = axes.axes_values_x[axes.axes_values_x.length - 1] - axes.axes_values_x[axes.axes_values_x.length - 2];
    var area_value_y = axes.axes_values_y[axes.axes_values_y.length - 1] - axes.axes_values_y[axes.axes_values_y.length - 2];

    area.beginPath();

    for(var i = 0; i < data.series.length; i++) {
        var rest_x = (data.series[i][0] / area_value_x) * axes.area_x;
        var rest_y = (data.series[i][1] / area_value_y) * axes.area_y;

        if(i == 0) {
            area.changeStartPoint(rest_x, rest_y);
        }
        else {
            area.createLine(rest_x, rest_y);
        }
    }
    area.stroke();
}


/**
 * Function calculate maximal and minimal value of X and Y axes.
 * Based on maximal and minimal values of all Chart functions
 * 
 * @param {Array} data  Chart data series and Chart type.
 * 
 * @see #jpf.chart.[XX]Series
 */

jpf.chart.calculateAxes = function(data) {
    var x_max, x_min, y_max, y_min;
    x_max = x_min = 0;
    y_max = y_min = 0;
    
    for(var i = 0; i < data.length; i++) {
        if(data[i].x_max > x_max) {
            x_max = data[i].x_max;
        }
        if(data[i].x_min < x_min) {
            x_min = data[i].x_min;
        }
        if(data[i].y_max > y_max) {
            y_max = data[i].y_max;
        }
        if(data[i].y_min < y_min) {
            y_min = data[i].y_min;
        }
    }
        
    return {
        x_max : x_max, x_min : x_min,
        y_max : y_max, y_min : y_min
    }
}

/**
 * Function get data series from tables, and return them in
 * compatible version to Chart 
 * 
 * @param {Array} series  data series [[x,y],[x1,y1]...]
 * @param {String} type   type of chart
 * 
 * @return {Hash Array}   Series, type, maximal and minimal values of X and Y axes
 */

jpf.chart.tableSeries = function(series, type, options) {
    var x_max, x_min, y_max, y_min;
    //Set X & Y range
    if(type !== "pie"){
        x_max = x_min = series[0][0];
        y_max = y_min = series[0][1];
        
        for(var i = 0; i < series.length; i++) {
            if(series[i][0] > x_max) {
                x_max = series[i][0];
            }
            if(series[i][0] < x_min) {
                x_min = series[i][0];
            }
            if(series[i][1] > y_max) {
                y_max = series[i][1];
            }
            if(series[i][1] < y_min) {
                y_min = series[i][1];
            }
        }
    //End of set X & Y range
    }
    else{
        x_max = x_min = 0;
        y_max = y_min = 0;
    }

    return {
        series : series, 
        x_max : x_max, x_min : x_min,
        y_max : y_max, y_min : y_min,
        type : type,
        options : options
    };
}