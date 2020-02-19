// Internal state.
var CURRENT_INPUT_GRID = new Grid(3, 3);
var CURRENT_OUTPUT_GRID = new Grid(3, 3);
var TEST_PAIRS = new Array();
var CURRENT_TEST_PAIR_INDEX = 0;
var COPY_PASTE_DATA = new Array();

// Cosmetic.
var EDITION_GRID_HEIGHT = 500;
var EDITION_GRID_WIDTH = 500;
var MAX_CELL_SIZE = 100;


function resetTask() {
    CURRENT_INPUT_GRID = new Grid(3, 3);
    TEST_PAIRS = new Array();
    CURRENT_TEST_PAIR_INDEX = 0;
    $('#task_preview').html('');
    $('#answer_preview').html('');
    if (VIEW == 0) {
        resetOutputGrid();
    }
}

function refreshEditionGrid(jqGrid, dataGrid) {
    fillJqGridWithData(jqGrid, dataGrid);
    setUpEditionGridListeners(jqGrid);
    fitCellsToContainer(jqGrid, dataGrid.height, dataGrid.width, EDITION_GRID_HEIGHT, EDITION_GRID_HEIGHT);
    initializeSelectable();
}

function syncFromEditionGridToDataGrid() {
    copyJqGridToDataGrid($('#output_grid .edition_grid'), CURRENT_OUTPUT_GRID);
}

function syncFromDataGridToEditionGrid() {
    refreshEditionGrid($('#output_grid .edition_grid'), CURRENT_OUTPUT_GRID);
}

function getSelectedSymbol() {
    selected = $('#symbol_picker .selected-symbol-preview')[0];
    return $(selected).attr('symbol');
}

function setUpEditionGridListeners(jqGrid) {
    jqGrid.find('.cell').click(function (event) {
        cell = $(event.target);
        symbol = getSelectedSymbol();
        console.log(symbol)
        mode = $('input[name=tool_switching]:checked').val();
        if (mode == 'floodfill') {
            // If floodfill: fill all connected cells.
            syncFromEditionGridToDataGrid();
            grid = CURRENT_OUTPUT_GRID.grid;
            floodfillFromLocation(grid, cell.attr('x'), cell.attr('y'), symbol);
            syncFromDataGridToEditionGrid();
        } else if (mode == 'edit') {
            // Else: fill just this cell.
            setCellSymbol(cell, symbol);
        }
    });
}

function resizeOutputGrid() {
    size = $('#output_grid_size').val();
    size = parseSizeTuple(size);
    height = size[0];
    width = size[1];

    jqGrid = $('#output_grid .edition_grid');
    syncFromEditionGridToDataGrid();
    dataGrid = JSON.parse(JSON.stringify(CURRENT_OUTPUT_GRID.grid));
    CURRENT_OUTPUT_GRID = new Grid(height, width, dataGrid);
    refreshEditionGrid(jqGrid, CURRENT_OUTPUT_GRID);
}

function resetOutputGrid() {
    syncFromEditionGridToDataGrid();
    CURRENT_OUTPUT_GRID = new Grid(3, 3);
    syncFromDataGridToEditionGrid();
    resizeOutputGrid();
}

function copyFromQuestion() {
    CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(CURRENT_QUESTION_GRID.grid);
    syncFromDataGridToEditionGrid();
    $('#output_grid_size').val(CURRENT_OUTPUT_GRID.height + 'x' + CURRENT_OUTPUT_GRID.width);
}

function copyFromAnswer() {
    CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(CURRENT_ANSWER_GRID.grid);
    syncFromDataGridToEditionGrid();
    $('#output_grid_size').val(CURRENT_OUTPUT_GRID.height + 'x' + CURRENT_OUTPUT_GRID.width);
}

function fillPairPreview(pairId, inputGrid, outputGrid) {
    var pairSlot = $('#pair_preview_' + pairId);
        // Create HTML for pair.
    slotLabel = $('<div class="preview_tag">样例' +  pairId + '</div>')
    pairSlot = $('<div id="pair_preview_' + pairId + '" class="pair_preview" index="' + pairId + '"></div>');
    slotLabel.appendTo('#task_preview');
    pairSlot.appendTo('#task_preview');
    var jqInputGrid = pairSlot.find('.input_preview');
    gridLabel = $('<div><div class="grid_label">问题</div><div class="grid_label">答案</div></div>');
    jqInputGrid = $('<div class="input_preview"></div>');
    gridLabel.appendTo(pairSlot);
    jqInputGrid.appendTo(pairSlot);
    var jqOutputGrid = pairSlot.find('.output_preview');
    jqOutputGrid = $('<div class="output_preview"></div>');
    jqOutputGrid.appendTo(pairSlot);

    fillJqGridWithData(jqInputGrid, inputGrid);
    fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 200, 200);
    fillJqGridWithData(jqOutputGrid, outputGrid);
    fitCellsToContainer(jqOutputGrid, outputGrid.height, outputGrid.width, 200, 200);
}

function fillAPairPreview(pairId, inputGrid, outputGrid) {
    var pairSlot = $('#answer_pair_preview_' + pairId);
    if (!pairSlot.length) {
        // Create HTML for pair.
        pairSlot = $('<div id="answer_pair_preview_' + pairId + '" class="pair_preview" index="' + pairId + '"></div>');
        pairSlot.appendTo('#answer_preview');
    }
    var jqInputGrid = pairSlot.find('.input_preview');
    if (!jqInputGrid.length) {
        jqInputGrid = $('<div class="input_preview"></div>');
        jqInputGrid.appendTo(pairSlot);
    }
    var jqOutputGrid = pairSlot.find('.output_preview');
    if (!jqOutputGrid.length) {
        jqOutputGrid = $('<div class="output_preview" style="display: none"></div>');
        jqOutputGrid.appendTo(pairSlot);
    }

    fillJqGridWithData(jqInputGrid, inputGrid);
    fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 200, 200);
    fillJqGridWithData(jqOutputGrid, outputGrid);
    fitCellsToContainer(jqOutputGrid, outputGrid.height, outputGrid.width, 200, 200);
}

function loadJSONTask(train, test) {
    resetTask();
    $('#modal_bg').hide();
    $('#error_display').hide();
    $('#info_display').hide();

    for (var i = 0; i < train.length; i++) {
        pair = train[i];
        values = pair['input'];
        input_grid = convertSerializedGridToGridObject(values)
        values = pair['output'];
        output_grid = convertSerializedGridToGridObject(values)
        fillPairPreview(i, input_grid, output_grid);
    }
    if (test.length > 1) {
        TEST_EXAMPLE_ID = Math.floor(Math.random() * test.length)
    } else {
        TEST_EXAMPLE_ID = 0
    }
    pair = test[TEST_EXAMPLE_ID]
    TEST_PAIRS.push(pair);
    values1 = pair['input'];
    input_grid = convertSerializedGridToGridObject(values1)
    values2 = pair['output'];
    output_grid = convertSerializedGridToGridObject(values2)
    fillAPairPreview(i, input_grid, output_grid);
    CURRENT_QUESTION_GRID = convertSerializedGridToGridObject(values1)
    CURRENT_ANSWER_GRID = convertSerializedGridToGridObject(values2)
}

function loadTaskFromFile(e) {
    var file = e.target.files[0];
    if (!file) {
        errorMsg('No file selected');
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;

        try {
            contents = JSON.parse(contents);
            train = contents['train'];
            test = contents['test'];
        } catch (e) {
            errorMsg('Bad file format');
            return;
        }
        loadJSONTask(train, test);
    };
    reader.readAsText(file);
}

function Start() {
    USERNAME = $("#username").val()
    randomTask();
}

function loadJSONLabels() {
    // remember percentage of scroll
    scrollNum = $('#label_list, .list').scrollTop()
    $('#label_list, .list').html('');
    // refresh example list
    $.ajax({
            url: "/list",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: USERNAME
            })
        })
        .done(function (data) {
            data = JSON.parse(data)
            labels = data["labels"]
            for (var i = 0; i < labels.length; i++) {
                id = labels[i].split(".json")[0]
                item = $('<div class="item" data-id="' + id + '">' + labels[i] + '</div>');
                item.appendTo('#label_list, .list');
            }
            $('#label_list, .list').scrollTop(scrollNum)
        });
}

function LoadTask() {
    var task_url = TASK["download_url"].split("master/")[1]
    console.log(task_url)
    $.getJSON(task_url, function (json) {
        try {
            train = json['train'];
            test = json['test'];
        } catch (e) {
            errorMsg('Bad file format');
            return;
        }
        loadJSONTask(train, test);
        //   $('#load_task_file_input')[0].value = "";
        infoMsg("Loaded task training/" + TASK["name"]);
    })
    loadJSONLabels()
}

// function randomTask() {
//     VIEW = 0
//     $.getJSON("training.json", function (training_tasks) {
//         $.getJSON("evaluation.json", function (evaluation_tasks) {
//             TASKS = training_tasks.concat(evaluation_tasks)
//             var task = TASKS[Math.floor(Math.random() * TASKS.length)];
//             TASK = task
//             LoadTask()
//         })
//     })
// }

function randomTask() {
    VIEW = 0
    $.getJSON("sub_evaluation.json", function (evaluation_tasks) {
        TASKS = evaluation_tasks
        var task = TASKS[Math.floor(Math.random() * TASKS.length)];
        TASK = task
        LoadTask()
    })
}

function nextTestInput() {
    if (TEST_PAIRS.length <= CURRENT_TEST_PAIR_INDEX + 1) {
        errorMsg('No next test input. Pick another file?')
        return
    }
    CURRENT_TEST_PAIR_INDEX += 1;
    values = TEST_PAIRS[CURRENT_TEST_PAIR_INDEX]['input'];
    CURRENT_INPUT_GRID = convertSerializedGridToGridObject(values)
    fillTestInput(CURRENT_INPUT_GRID);
    $('#current_test_input_id_display').html(CURRENT_TEST_PAIR_INDEX + 1);
    $('#total_test_input_count_display').html(test.length);
}

function saveSolution() {
    $("#submit_solution_btn").hide();
    $("#cancel_solution_btn").show();
    $("#check_solution_btn").show();
    $("#check_span").show();
}

function cancelSave() {
    $("#submit_solution_btn").show();
    $("#cancel_solution_btn").hide();
    $("#check_solution_btn").hide();
    $("#check_span").hide();
}

function checkEqual() {
    res = JSON.stringify(CURRENT_ANSWER_GRID.grid) === JSON.stringify(CURRENT_OUTPUT_GRID.grid)
    console.log(res)
    return res
}

function onSubmit() {
    syncFromEditionGridToDataGrid();
    res = checkEqual();
    if(res == true) {
        alert("回答正确！回忆下有什么易错的环节吧，提交一个干扰项");
        console.log($(".output_preview"))
        $(".output_preview").show();
        $("#cpfroma").show();
    }
    else {
        alert("干扰项已保存，下一题");
        $(".output_preview").hide();
        $("#cpfroma").hide();
        checkSave();
        randomTask(); // refresh task
        cancelSave(); // refresh button
    }
}

function checkSave() {
    syncFromEditionGridToDataGrid();
    res = checkEqual();
    if (VIEW == 1) {
        overwrite = 1
        filename = FILENAME
        console.log(FILENAME)
    } else {
        overwrite = 0
        filename = ""
    }
    $.ajax({
            url: "/",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                sha: TASK["sha"],
                grid: CURRENT_OUTPUT_GRID.grid,
                username: USERNAME,
                idx: TEST_EXAMPLE_ID,
                overwrite: overwrite,
                filename: filename
            })
        })
        .done(function (data) {
            console.log(data)
        });
}

function fillTestInput(inputGrid) {
    jqInputGrid = $('#evaluation_input');
    fillJqGridWithData(jqInputGrid, inputGrid);
    fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 400, 400);
}

function initializeSelectable() {
    try {
        $('.selectable_grid').selectable('destroy');
    } catch (e) {}
    toolMode = $('input[name=tool_switching]:checked').val();
    if (toolMode == 'select') {
        infoMsg('Select some cells and click on a color to fill in, or press C to copy');
        $('.selectable_grid').selectable({
            autoRefresh: false,
            filter: '> .row > .cell',
            start: function (event, ui) {
                $('.ui-selected').each(function (i, e) {
                    $(e).removeClass('ui-selected');
                });
            }
        });
    }
}

// Initial event binding.

$(document).ready(function () {
    $('#symbol_picker').find('.symbol_preview').click(function (event) {
        symbol_preview = $(event.target);
        $('#symbol_picker').find('.symbol_preview').each(function (i, preview) {
            $(preview).removeClass('selected-symbol-preview');
        })
        symbol_preview.addClass('selected-symbol-preview');

        toolMode = $('input[name=tool_switching]:checked').val();
        if (toolMode == 'select') {
            $('.edition_grid').find('.ui-selected').each(function (i, cell) {
                symbol = getSelectedSymbol();
                setCellSymbol($(cell), symbol);
            });
        }
    });

    $('.edition_grid').each(function (i, jqGrid) {
        setUpEditionGridListeners($(jqGrid));
    });

    $('.load_task').on('change', function (event) {
        loadTaskFromFile(event);
    });

    $('.load_task').on('click', function (event) {
        event.target.value = "";
    });

    $('input[type=radio][name=tool_switching]').change(function () {
        initializeSelectable();
    });

    $('body').keydown(function (event) {
        // Copy and paste functionality.
        if (event.which == 67) {
            // Press C

            selected = $('.ui-selected');
            if (selected.length == 0) {
                return;
            }

            COPY_PASTE_DATA = [];
            for (var i = 0; i < selected.length; i++) {
                x = parseInt($(selected[i]).attr('x'));
                y = parseInt($(selected[i]).attr('y'));
                symbol = parseInt($(selected[i]).attr('symbol'));
                COPY_PASTE_DATA.push([x, y, symbol]);
            }
            infoMsg('Cells copied! Select a target cell and press V to paste at location.');

        }
        if (event.which == 86) {
            // Press P
            if (COPY_PASTE_DATA.length == 0) {
                errorMsg('No data to paste.');
                return;
            }
            selected = $('.edition_grid').find('.ui-selected');
            if (selected.length == 0) {
                errorMsg('Select a target cell on the output grid.');
                return;
            }

            jqGrid = $(selected.parent().parent()[0]);

            if (selected.length == 1) {
                targetx = parseInt(selected.attr('x'));
                targety = parseInt(selected.attr('y'));

                xs = new Array();
                ys = new Array();
                symbols = new Array();

                for (var i = 0; i < COPY_PASTE_DATA.length; i++) {
                    xs.push(COPY_PASTE_DATA[i][0]);
                    ys.push(COPY_PASTE_DATA[i][1]);
                    symbols.push(COPY_PASTE_DATA[i][2]);
                }

                minx = Math.min(...xs);
                miny = Math.min(...ys);
                for (var i = 0; i < xs.length; i++) {
                    x = xs[i];
                    y = ys[i];
                    symbol = symbols[i];
                    newx = x - minx + targetx;
                    newy = y - miny + targety;
                    res = jqGrid.find('[x="' + newx + '"][y="' + newy + '"] ');
                    if (res.length == 1) {
                        cell = $(res[0]);
                        setCellSymbol(cell, symbol);
                    }
                }
            } else {
                errorMsg('Can only paste at a specific location; only select *one* cell as paste destination.');
            }
        }
    });
});