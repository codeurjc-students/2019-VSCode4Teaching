var myChart = echarts.init(document.getElementById("diagram"));
function generateDiagram(chapterNames, unmarked, correct, incorrect){
	var option = {
	  color: ["#27A1EE", "#F05050", "#43C472"],
	  tooltip: {},
	  legend: {
	    data: [
	      "Respuestas sin corregir",
	      "Respuestas incorrectas",
	      "Respuestas correctas"
	    ]
	  },
	  xAxis: {
	    data: chapterNames
	  },
	  yAxis: {},
	  series: [
	    {
	      name: "Respuestas sin corregir",
	      type: "bar",
	      stack: "Tema",
	      data: unmarked
	    },
	    {
	      name: "Respuestas incorrectas",
	      type: "bar",
	      stack: "Tema",
	      data: correct
	    },
	    {
	      name: "Respuestas correctas",
	      type: "bar",
	      stack: "Tema",
	      data: incorrect
	    }
	  ]
	};
	myChart.setOption(option);
}