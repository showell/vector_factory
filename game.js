
function style_shelf() {
    const elem = document.getElementById("shelf");
    elem.style.border = "1px solid green";
    elem.style.marginBottom = "30px";
}

function style_workbench() {
    const wb = document.querySelector("#workbench");
    wb.style.display = "flex";
    wb.style.flexDirection = "row";
    wb.style.minWidth = "400px";
    wb.style.marginBottom = "10px";

    {
        const elem = wb.querySelector("#matrix");
        elem.style.marginRight = "20px";
    }
    
    {
        const elem = wb.querySelector("#in_vector");
        elem.style.marginRight = "40px";
    }
}

style_shelf();
style_workbench();
