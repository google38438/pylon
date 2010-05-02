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

//#ifdef __WITH_PLANE
/**
 * @private
 */
apf.plane = {
    init : function(){
        if (!this.plane) {
            this.plane                  = document.createElement("DIV");
            document.body.appendChild(this.plane);
            this.plane.style.background = "url(images/spacer.gif)";
            this.plane.style.position   = "fixed";
            this.plane.style.zIndex     = 100000000;
            this.plane.style.left       = 0;
            this.plane.style.top        = 0;
            this.plane.host             = false;
            //this.plane.style.backgroundColor = "red";
        }
    },

    lastCursor : null,
    show : function(o, dontAppend, copyCursor, useRealSize){
        this.init();

        var plane    = this.plane;
        
        if (o) { //@experimental
            this.current = o;
            if (!dontAppend) {
                this.lastZ = this.current.style.zIndex;
                this.current.style.zIndex = 100000;
            }
            else {
                this.plane.appendChild(o);
            }
        }
        
        var pWidth = (plane.parentNode == document.body
            ? useRealSize ? document.documentElement.offsetWidth : apf.getWindowWidth()
            : plane.parentNode.offsetWidth);
 
        var pHeight = (plane.parentNode == document.body
            ? useRealSize ? document.documentElement.offsetHeight : apf.getWindowHeight()
            : plane.parentNode.offsetHeight);
        
        if (copyCursor) {
            if (this.lastCursor === null)
                this.lastCursor = document.body.style.cursor;
            document.body.style.cursor = apf.getStyle(o, "cursor");
        }
        
        this.plane.style.display = "block";
        //this.plane.style.left    = p.scrollLeft;
        //this.plane.style.top     = p.scrollTop;
        
        var diff = apf.getDiff(plane.parentNode);
        this.plane.style.width  = (pWidth - diff[0]) + "px";
        this.plane.style.height = (pHeight - diff[1]) + "px";

        return plane;
    },

    //#ifndef __WITH_XMLDATABASE
    isChildOf : function(pNode, childnode){
        var loopnode = childnode.parentNode;
        while(loopnode){
            if(loopnode == pNode)
                return true;
            loopnode = loopnode.parentNode;
        }

        return false;
    },
    //#endif

    hide : function(){
        if (!this.plane)
            return;
        
        var isChild =
            //#ifdef __WITH_XMLDATABASE
            apf.isChildOf(this.plane, document.activeElement);
            /* #else
            this.isChildOf(this.plane, document.activeElement);
            #endif */
        
        if (this.current) {
            if (this.lastZ !== null) {
                if (this.current.style.zIndex == 100000)
                    this.current.style.zIndex = this.lastZ;
                this.lastZ = null;
            }
    
            if (this.current.parentNode == this.plane)
                this.plane.parentNode.appendChild(this.current);
        }
        
        this.plane.style.display  = "none";
        
        if (isChild) {
            if (!apf.isIE)
                document.activeElement.focus();
            apf.document.activeElement.$focus();
        }
        
        this.current = null;
        
        if (this.lastCursor !== null) {
            document.body.style.cursor = this.lastCursor;
            this.lastCursor = null;
        }
        
        return this.plane;
    }
};
//#endif
