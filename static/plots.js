



var $sampleMetadata = document.getElementById("sampleMetadata");

// var $bubble = document.getElementById("bubble");

var $gauge = document.getElementById("gauge");

// Create a drop down menu

// d3.json("/names", function(error, response) {
//     if (error) return console.log(error);

//     // console.log(response);
//     var items = response;

//     // console.log(items);
//     for (var i = 0; i < items.length; i++) {

//         // Create an option elemeent
//         var $option = document.createElement("option");
//         $option.setAttribute("value", items[i]);
//         $option.innerHTML = items[i];

//         // Append to select tag
//         $selDataset.appendChild($option);

//     };

// });


function getOptions() {
	Plotly.d3.json("/names", function(error, sampleNames) {
		// console.log(sampleNames);
		var selector = document.getElementById("selDataset")
		for (var i=0; i<sampleNames.length; i++) {
			var currentOption=document.createElement('option');
			currentOption.text = sampleNames[i];
			currentOption.value = sampleNames[i];
			selector.appendChild(currentOption);
		}
	})
}


function init() {
	getOptions();
};






function optionChanged(selectedValue){
	console.log(selectedValue);

	Plotly.d3.json("/metadata/"+selectedValue, function(error, response) {

        if (error) console.log(error);
        console.log(response);
		// var $sampleMetadata = document.getElementById("sampleMetadata");

        $sampleMetadata.innerHTML = "";

        var keys = Object.keys(response);

        for (var i = 0; i < keys.length; i++) {
            var $p = document.createElement("p");
            $p.innerHTML = `${keys[i]}: ${response[keys[i]]}`;
            $sampleMetadata.appendChild($p);
        };
    });





	Plotly.d3.json("/samples/"+selectedValue, function(error, response) {
		
        if (error) console.log(error);
        console.log(response);

        var idSlice = response.otu_ids.slice(0,10);
        var valueSlice = response.sample_values.slice(0,10);

        var pieIds = [];
        var pieValues = [];

        for (var i = 0; i < valueSlice.length; i++) {
            if (valueSlice[i] != 0) {
                pieIds.push(idSlice[i]);
                pieValues.push(valueSlice[i]);
            };
        };

        d3.json("/otu", function(error, response) {
            if (error) console.log(error);
         });   
            // Pie chart labels
            var pieLabels = [];
            for (var i = 0; i < pieIds.length; i++) {
                pieLabels.push(response[pieIds[i]]);
            };

            var pieData = [{
                values: pieValues,
                labels: pieIds,
                type: "pie",
                hovertext: pieLabels
            }];

            Plotly.newPlot("pie", pieData);

        // Bubble plot variables

        var bubbleIds = [];
        var bubbleValues = [];

        for (var i = 0; i < response.sample_values.length; i++) {
            if (response.sample_values[i] != 0) {
                bubbleIds.push(response.otu_ids[i]);
                bubbleValues.push(response.sample_values[i]);
            };
        };

            // Bubble plot labels
            var bubbleLabels = [];
            for (var i = 0; i < bubbleIds.length; i++) {
                bubbleLabels.push(response[bubbleIds[i]]);
            }
            var bubbleData = [{
                x: bubbleIds,
                y: bubbleValues,
                mode: "markers",
                text: bubbleLabels,
                marker: {
                    size: bubbleValues,
                    color: bubbleIds.map(row=>row),
                    colorscale: "Rainbow"
                }
            }];
            var bubbleLayout = {
                xaxis: {
                    title: "OTU ID"
                }
            };

            Plotly.newPlot("bubble", bubbleData, bubbleLayout);

        });

  



 // Gauge plot on Srubs per Week
    Plotly.d3.json("/wfreq/"+selectedValue, function(error, response) {

        if (error) console.log(error);
        console.log(response);
        level = response
	        // Trig to calc meter point
		var degrees = 180 - (20*level),

		     radius = .5;
		var radians = degrees * Math.PI / 180;
		var x = radius * Math.cos(radians);
		var y = radius * Math.sin(radians);
		console.log(degrees);
		// Path: may have to change to create a better triangle
		var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
		     pathX = String(x),
		     space = ' ',
		     pathY = String(y),
		     pathEnd = ' Z';
		var path = mainPath.concat(pathX,space,pathY,pathEnd);

		var data = [{ type: 'scatter',
		   x: [0], y:[0],
		    marker: {size: 28, color:'850000'},
		    showlegend: false,
		    name:'WFREQ',
		    text: '',
		    hoverinfo: 'text+name'},
		  { values: [90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90],
		  rotation: 90,
		  text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
		  textinfo: 'text',
		  textposition:'inside',
		  marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(45, 154, 30, .5)', 'rgba(70, 202, 60, .5)',
		  					'rgba(95, 209, 95, .5)', 'rgba(120, 110, 145, .5)', 'rgba145, 140, 202, .5)',
		  					'rgba(175, 209, 95, .5)', 'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)', 
		  					'rgba(255, 255, 255, 0)']},
		  labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
		  hoverinfo: 'label',
		  hole: .5,
		  type: 'pie',
		  showlegend: false
		}];

		var layout = {
		  shapes:[{
		      type: 'path',
		      path: path,
		      fillcolor: '850000',
		      line: {
		        color: '850000'
		      }
		    }],
		  title: 'Scrubs per Week', 
		 
		  height: 500,
		  width: 500,
		  xaxis: {zeroline:false, showticklabels:false,
		             showgrid: false, range: [-1, 1]},
		  yaxis: {zeroline:false, showticklabels:false,
		             showgrid: false, range: [-1, 1]}
		};

Plotly.newPlot('gauge', data, layout);
    });




};


init();