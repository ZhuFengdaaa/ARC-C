$(document).on('click', '#label_list, .list, .item', function (event) {
    VIEW = 1
    $(this).addClass("selected")
    FILENAME = "label_" + USERNAME + "/" + $(this).html();
    $.getJSON(FILENAME, function (data) {
        sha = data["sha"]
        find = 0
        idx = undefined
        for (var i = 0; i < TASKS.length; i++) {
            if (TASKS[i]["sha"] == sha) {
                find += 1
                idx = i
            }
        }
        console.assert(find == 1)
        TASK = TASKS[idx]
        LoadTask()
        CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(data["grid"])
        console.log(CURRENT_OUTPUT_GRID)
        syncFromDataGridToEditionGrid()
    })
    event.stopPropagation();
});