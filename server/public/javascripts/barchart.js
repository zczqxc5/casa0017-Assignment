$(document).ready(function () {
  var id, shortname, formattedDate, formattedTime;
  var dataArray;

  $("#dropdown").change(function () {
    id = $(this).val();
    shortname = $("#dropdown :selected").text();
  });
  $('#datetimepicker').datetimepicker({
    defaultDate: 0,
    step: 30,
    minDate: '2020/01/01',
    maxDate: 0,
    maxTime: 0
  }).change(function () {
    var startDate = $(this).val();
    var dateObject = new Date(startDate);
    formattedDate = dateObject.toISOString().split('T')[0];
    formattedTime = dateObject.toLocaleTimeString('en-US', { hour12: false });
  });
  $("#submit").click(function () {
    const requestData = {
      regionid: id,
      shortname: shortname,
      date: formattedDate,
      time: formattedTime
    };
    const jsonData = JSON.stringify(requestData);
    const url = "http://localhost:3000/map/data";

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        dataArray = JSON.parse(data[0].data);
        drawBarChart(dataArray);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});

google.charts.load('current', { 'packages': ['bar'] });
google.charts.setOnLoadCallback(drawBarChart);

function drawBarChart(data) {
  // 检查数据是否为空
  if (!data || data.length === 0) {
    // 如果数据为空，创建一个空的数据表
    var emptyDataTable = new google.visualization.DataTable();
    emptyDataTable.addColumn('string', 'Fuel');
    emptyDataTable.addColumn('number', 'Percent');
    emptyDataTable.addRow(['', 0]); // 添加一个初始的空数据行

    // 创建一个空白的图表
    var options = {
      title: 'Fuel Percentage',
      chartArea: { width: '50%' },
      hAxis: {
        title: 'Percentage',
        minValue: 0,
        maxValue: 100
      },
      vAxis: {
        title: 'Fuel'
      }
    };

    var emptyChart = new google.charts.Bar(document.getElementById('barchart_material'));
    emptyChart.draw(emptyDataTable, google.charts.Bar.convertOptions(options));
  } else {
    // 如果数据不为空，绘制正常的图表
    var dataTable = new google.visualization.DataTable(data);
    dataTable.addColumn('string', 'Fuel');
    dataTable.addColumn('number', 'Percent');

    for (var i = 0; i < data.length; i++) {
      dataTable.addRow([data[i].fuel, data[i].perc]);
    }

    var options = {
      title: 'Fuel Percentage',
      chartArea: { width: '50%' },
      hAxis: {
        title: 'Percentage',
        minValue: 0,
        maxValue: 100
      },
      vAxis: {
        title: 'Fuel'
      }
    };

    var chart = new google.charts.Bar(document.getElementById('barchart_material'));
    chart.draw(dataTable, google.charts.Bar.convertOptions(options));
  }
}