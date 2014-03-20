/* ###############################################################################
 * ##
 * ##							Tool Object
 * ##
 * ############################################################################### */
function pencil(scope, element, ctx, ch){
	//Variables
	var tool = this;
	var element = element;
	var context = ctx;
	var $scope = scope;
	var channel = ch;

	//Coordinates used for drawing
	var lastX;
	var lastY;

	this.started = false;

	//Mouseup
	this.mouseup = function(obj){
		if (tool.started) {
	      tool.started = false;
	    };
	};

	//Mousedown
	this.mousedown = function(obj){
		lastX = obj.pre.x;
		lastY = obj.pre.y;
		context.beginPath();
		tool.started = true;
	};

	//Mousemove
	this.mousemove = function(obj){
		if (tool.started) {
			//last coordinates
			obj.op.lX = lastX;
			obj.op.lY = lastY;
			//current coordinates
	      	obj.op.cX = obj.pre.x;
	      	obj.op.cY = obj.pre.y;
	      	//null unused data
	      	obj.pre.x = 0;
	      	obj.pre.y = 0;
	      	//draw function
	      	obj.type = "draw";

	      	//Publish the object
	      	fayeClient.publish("/" + channel, JSON.stringify(obj), function(err){
	          console.log( "Error ",err );
	        });

	      	//new = old coordinates
			lastX = obj.op.cX;
			lastY = obj.op.cY;
	    }
	};

	//clear
	this.clear = function(obj){
		element[0].width = element[0].width; 
	};

	//draw
	this.draw = function(obj){
        ctx.moveTo(obj.op.lX,obj.op.lY);//from
        ctx.lineTo(obj.op.cX,obj.op.cY);//to
        ctx.strokeStyle = "#4bf";//color
        ctx.stroke();//draw it
	};

	//subscribe
	this.subscribe = function(obj){
		var toAdd = { type: 'otherIdClass', id: obj.clientId };
		if($scope.subId == ""){
			$scope.subId = obj.clientId;
			toAdd.type = 'myIdClass';
		}
		$scope.addMember(toAdd);
	};

	//unsubscribe
	this.unsubscribe = function(obj){
		$scope.removeMember(obj.clientId);
	};
}
