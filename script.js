var System = {
    "version":2,
    "config":null,
    "member":{},
    "time":null,
    "focus_timer":null,
    "content":"list",
    "search":{},
    "SerialNumber":null,
    "char_default":{
        "name":"",
        "game_sn":"",
        "wolf_win":0,
        "human_win":0,
        "wolf_lose":0,
        "human_lose":0,
        "item":{"money":150},
        "game_day":"0",
        "game_time":"",
        "game_end":"",
        "vote":{"0":{"value":"","time":""}},
        "pass":{"0":{"value":"","time":""}},
        "wolf":{"0":{"value":"","time":""}},
        "divine":{"0":{"value":"","time":""}},
        "psychic":{"0":{"value":"","time":""}},
        "guard":{"0":{"value":"","time":""}},
        "human":{"0":{"value":"","time":""}},
        "ready":"no",
        "dead":{"status":"live"}
    },
    "c_s_word":{
        "name":"帳號名稱",
        "wolf_win":"狼勝場數",
        "human_win":"人勝場數",
        "wolf_lose":"狼敗場數",
        "human_lose":"人敗場數",
        "item":"持有金錢"
    },
    "create_game_row":{
        "name":{
            "name":"遊戲名稱",
            "type":"text",
            "value":"遊戲名稱"
        },
        "game_password":{
            "name":"進入密碼",
            "type":"text",
            "value":"進入密碼"
        },
        "game_memo":{
            "name":"遊戲說明",
            "type":"textarea",
            "value":"遊戲說明"
        },
        "game_nickname":{
            "name":"此局角色名稱",
            "type":"text",
            "value":"此局角色名稱"
        },
        "char_count":{
            "name":"遊戲人數",
            "type":"number",
            "value":8
        },
        "wolf_count":{
            "name":"人狼數量",
            "type":"number",
            "value":2
        },
        "divine_count":{
            "name":"先知數量",
            "type":"number",
            "value":1
        },
        "guard_count":{
            "name":"守衛數量",
            "type":"number",
            "value":1
        },
        "psychic_count":{
            "name":"靈媒數量",
            "type":"number",
            "value":1
        }
    },
    "job_word":{
        "psychic":"靈媒",
        "guard":"守衛",
        "wolf":"人狼",
        "divine":"先知",
        "human":"村民"
    },
    "_sessionStorage":{}
};

window.onload = function()
{
    var div = document.createElement("div");
    div.id = "Mask";
    document.body.appendChild(div);
    document.body.className = "loading";
}

var DB = firebase;DB.initializeApp({databaseURL: "https://kfswolf-default-rtdb.firebaseio.com"});


DB = DB.database();
DB.ref("/system/config").once( "value",config=>{ 
    System.config = config.val();

    document.title = "網頁狼人【版本:"+System.version+"】";

    Main();

});




function SortData(list,row,mode = 1)
{
    var _list = [];
    for(var idx in list)
    {
        var _list_idx = _list.length;
        _list[ _list_idx ] = list[idx];

        _list[ _list_idx ]["_sort"] = list[idx][row];
    }


    if(mode==1)
    {
        _list.sort(function(a,b){
            if(a._sort>b._sort) return -1;
            return 1;
        });
    }
    else
    {
        _list.sort(function(a,b){
            if(a._sort>b._sort) return 1;
            return -1;
        });
    }
    

    for(var idx in _list)
    {
        delete _list[idx]["_sort"];
    }


    return _list;
}



//menu=>obj,div=>div容器
function RowMake(menu,div,id)
{
    for(var i in menu)
    {
        var input = document.createElement("input");
        if(menu[i].type==="textarea")
        {
            input = document.createElement("textarea");
            input.defaultValue = menu[i].value;
        }


        var span = document.createElement("span");

        input.id = i;

        for(var attr in menu[i])
        {
            input.setAttribute(attr,menu[i][attr]);
        } 
        
        span.innerHTML = menu[i].span||"";

        if(menu[i].event!==undefined)
        {
            for(var _on in menu[i].event)
                input.addEventListener(_on,menu[i].event[_on]);
        }

        var row_div = document.createElement("div");
        row_div.className = "row";

        row_div.appendChild(span);
        row_div.appendChild(input);


        div.appendChild(row_div);
    }
    
    document.querySelectorAll("#Menu ul>div").forEach(function(div,idx){
        div.innerHTML = "";
    });
    document.querySelector("div#"+id).appendChild(div);

    setTimeout(function(){
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);
}


//menu=>obj,div=>div容器
function ListMake(title,list,div,id)
{
    var table = document.createElement("table");
    table.id = "ListTable"

    var tr = document.createElement("tr");
    

    for(var row in title)
    {
        var td = document.createElement("td");

        td.innerHTML = title[row].title;

        td.setAttribute("id",title[row].id||"");
        td.className = title[row].title_class||"";

        
        for(var e_type in title[row].title_event)
        {
            td.addEventListener(e_type,title[row].title_event[e_type]);
        }

        tr.appendChild(td);
    }
    table.appendChild(tr);

    
    for(var a in list)
    {
        var tr = document.createElement("tr");

        for(var row in title)
        {
            var td = document.createElement("td");

            td.innerHTML = list[a][ title[row].html ];

            td.setAttribute("id",list[a][ title[row].id ]||"");
            td.className = title[row].class||"";

            td.className = list[a].class||td.className;

            for(var e_type in title[row].event)
            {
                if(list[a].event!=="remove")
                td.addEventListener(e_type,title[row].event[e_type]);
            }

            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    div.appendChild(table);


    document.querySelectorAll("#Menu ul>div").forEach(function(div,idx){
        div.innerHTML = "";
    });
    document.querySelector("div#"+id).appendChild(div);

    setTimeout(function(){
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);

}




function ServerTime()
{
    firebase.database().ref('/').update({"ServerTime":firebase.database.ServerValue.TIMESTAMP})
    .then(function (data) {
      firebase.database().ref('/')
        .once('value')
        .then(function (data) {
          var t = data.val();
          t = t.ServerTime;

          System.time = t;
          clearInterval(System._timer);

          var time_word = document.createElement("div");
          System._timer = setInterval(function(){
            System.time+=100;
            System.SerialNumber = System.time.toString().substr(1);

            if(document.querySelector("#Time"))
            {
                document.querySelector("#Time").innerHTML = 
                "【"+DateFormat(new Date(System.time))+"】";
            }
          },100);
        
          setTimeout(function(){
            document.querySelector("div#Mask").className = "off";
            
            setTimeout(function(){
                document.querySelector("div#Mask").style.display = "none";
                document.body.className = "";
            },500);
            
          },100);
          

          console.log('server time: ', t);
        }, function serverTimeErr(err) {
          console.log('coulnd nt reach to the server time !');
        });
    }, function (err) {
      console.log ('set time error:', err)
    });
}


function DateFormat(timestamp,time = false)
{
    var tmp = timestamp.toString().split(" ");
    var hms = tmp[4];

    tmp = tmp[3] + "/" + 
        parseInt(new Date(timestamp).getMonth()+1) + "/" + 
        new Date(timestamp).getDate();

    if(time===true) tmp = "";
    if(time===false) tmp += " ";
    if(time==="<BR>") tmp += "<BR>"
    

    tmp += hms.split(":")[0] + ":" 
        + hms.split(":")[1] + ":" 
        + hms.split(":")[2];

    return tmp;
}


function Shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function P(str)
{
    var [...ary] = str;
    Shuffle(ary);
    return ary.join("");
}

function Focus(_class)
{
    clearInterval(System.focus_timer);
    System.focus_timer = setInterval(function(){
        
        document.querySelectorAll(_class).forEach(function(obj){
            obj.classList.toggle("focus");
        });


    },300);
}


function CheckMobile()
{//true手機行動裝置 false非手機
    return (navigator.userAgent.indexOf("Mobile")!==-1)?true:false;
}