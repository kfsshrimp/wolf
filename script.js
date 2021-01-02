/*
DB 資料庫排序
DB 資料庫分頁
自動恢復AP HP
132行
*/
var System = {
    "config":null,
    "member":{},
    "char":{},
    "char_bonus_set":{},
    "battle":{},
    "time":null,
    "_timer":null,
    "sec_contdown":0,
    "attack_sec":60,
    "SerialNumber":null,
    "attack_line":{
        "line1":{
            "mode":1,
            "value":0,
            "timer":null
        },
        "line2":{
            "mode":1,
            "value":0,
            "timer":null
        },
        "line3":{
            "mode":1,
            "value":0,
            "timer":null
        }
    },
    "char_default":{
        "name":"",
        "battle_sn":"",
        "item":{"money":0},
        "job":"",
        "lv":1,
        "exp":0,
        "expm":10,
        "hpm":10,
        "hp":10,
        "mp":0,
        "mpm":0,
        "ap":100,
        "atk":1,
        "matk":0,
        "def":1,
        "mdef":0,
        "agi":1,
        "magi":1,
        "bonus":0
    },
    "c_s_word":{
        "name":"角色名稱",
        "lv":"等級",
        "exp":"經驗",
        "hp":"生命",
        "mp":"魔力",
        "atk":"物理攻擊",
        "matk":"魔法攻擊",
        "def":"物理防禦",
        "mdef":"魔法防禦",
        "agi":"物理敏捷",
        "magi":"詠唱速度",
        "bonus":"升級點數"
    },
    "job":{
        "skill":"技能開發家",
        "item":"道具鍛造家",
        "monster":"怪物研究家"
    },
    "skill_effect":{
        "atk":"物理攻擊",
        "matk":"魔法攻擊",
        "def":"物理防禦",
        "mdef":"魔法防禦",
        "agi":"物理敏捷",
        "magi":"詠唱速度"
    },
    "skill_cost":{
        "hp":"生命",
        "mp":"魔力"
    },
    "skill_need":{
        "lv":"等級",
        "hp":"生命",
        "mp":"魔力",
        "hpm":"最大生命",
        "mpm":"最大魔力",
        "atk":"物理攻擊",
        "matk":"魔法攻擊",
        "def":"物理防禦",
        "mdef":"魔法防禦",
        "agi":"物理敏捷",
        "magi":"詠唱速度"
    }
};


//var DB = firebase;DB.initializeApp({databaseURL: "https://kfsrpg.firebaseio.com"});

eval(atob("dmFyIERCID0gZmlyZWJhc2U7REIuaW5pdGlhbGl6ZUFwcCh7ZGF0YWJhc2VVUkw6ICJodHRwczovL2tmc3JwZy5maXJlYmFzZWlvLmNvbSJ9KTs="));

window.onload = function()
{
    var div = document.createElement("div");
    div.id = "Mask";
    document.body.appendChild(div);
    document.body.className = "loading";

    DB = DB.database();
    DB.ref("/system/config").once( "value",_sys=>{ 
        System.config = _sys.val();

        document.title = "網頁RPG【版本:"+System.config.version+"】";
        
        ServerTime();

        var _t = setInterval( function(){
            if(System.SerialNumber!==null)//ServerTime function set value
            {
                Main();
                clearInterval(_t);
            }
        },10);
    });

}



function Main()
{
    var _tmp = JSON.parse(localStorage.kfs||'{}');
    System.member = _tmp.rpg||{};

    System.session = JSON.parse(sessionStorage.rpg||'{}');
    

    if(System.member.account===undefined)
    {
        RegisterMember();
    }

 /*
    DB.ref("/char/"+ System.member.account ).update( {"time_last":firebase.database.ServerValue.TIMESTAMP} );
*/

    DB.ref("/char/"+ System.member.account ).once( "value",_c=>{
        System.char = _c.val()||{};

        if(System.char.name===undefined)
        {
            CreateChar();
        }


        ApHpMp( Math.ceil((System.time - System.char.time_last)/1000) );

        
        if(System.char.battle_sn!=="")
        DB.ref("/battle/"+System.char.battle_sn).once( "value",_b=>{

            battle = _b.val()||{};

            CheckBattleEnd(battle);
        });

        MenuLi();

        if(System.char.name==="") MenuClick("char_status","close");

        for(var _id in System.session.menu)
        {
            if( System.session.menu[_id].open=="open" ) MenuClick(_id,"close");
        }


    });


}

function MenuLi()
{
    var time = document.createElement("div");
    time.id = "Time";
    time.addEventListener("click",function(){
        document.querySelectorAll("#Menu ul>div").forEach(function(div,idx){
            div.style.height = "0px";
        });
    });


    var div = document.createElement("div");
    div.id = "Menu";
    var ul = document.createElement("ul");
    var list = {
        "account":{"name":"帳號管理"},
        "char_status":{"name":"玩家狀態"},
        "job_menu":{"name":"職業管理"},
        "char_list":{"name":"玩家清單"},
        "item":{"name":"道具"},
        "skill":{"name":"技能"},
        "quest":{"name":"探索"},
        "battle":{"name":"戰鬥"},
        "battle_log":{"name":"戰鬥記錄"}
    }

    if(System.char.name==="")
    {
        list = {
            "account":{"name":"帳號管理"},
            "char_status":{"name":"玩家狀態"}
        }
    }


    for(var i in list)
    {
        var li = document.createElement("li");
        li.id = i;
        li.innerHTML = list[i].name;

        ul.appendChild(li);

        var li_div = document.createElement("div");
        li_div.id = i;    
        ul.appendChild(li_div);
    }

    div.appendChild(ul);

    document.body.appendChild(time);
    document.body.appendChild(div);

    document.querySelectorAll("#Menu ul li").forEach(function(li){

        li.addEventListener("click",function(){MenuClick(li.id,"close");} );
        
    });

}


function MenuClick(id,act)
{
    System.session.menu = System.session.menu||{};
    System.session.menu[id] = System.session.menu[id]||{};

    for(var _id in System.session.menu)
    {
        if(_id==id)
        {
            System.session.menu[_id].open = "open";
            System.session.menu[_id].list_id = System.session.menu[_id].list_id||"list";
        }
        else
        {
            System.session.menu[_id].open = "close";
        }
    }

    sessionStorage.rpg = JSON.stringify(System.session);

    

    if(act=="close")
    {
        document.querySelectorAll("#Menu ul>div").forEach(function(div){
            div.style.height = "0px";
        });

        setTimeout(function(){
            MenuClick(id,"open");
        },0);
        return;
    }
    
    var div = document.createElement("div");
    div.id = "Main";

    var menu = {};

    if(id=="account")
    {
        menu = {
            "account":{
                "type":"text",
                "span":"帳號序號",
                "disabled":"disabled",
                "value":System.member.account},
            "password":{
                "type":"text",
                "span":"帳號繼承碼",
                "disabled":"disabled",
                "value":System.member.password||""},
            "button":{
                "type":"button",
                "value":"更新繼承碼",
                "span":"",
                "event":{"click":EditAccount}},
            "button2":{
                "type":"button",
                "value":"繼承已有帳號",
                "span":"",
                "event":{"click":OldAccount}},
            "button3":{
                "type":"button",
                "value":"清除帳號資料",
                "span":"",
                "event":{"click":DelAccount}}
        }

        RowMake(menu,div,id);
    }

    if(id=="char_status")
    {
        System.char_bonus_set = JSON.parse(JSON.stringify(System.char));

        var str = System.c_s_word;

        var line_ary = ["hp","mp","exp"];
        var no_bonus = ["name","lv","bonus","exp"];

        for(var i in System.char_default)
        {
            if(str[i]===undefined) continue;

            menu[i] = {
                "type":"text",
                "span":str[i],
                "disabled":"disabled",
                "value":JSON.parse(JSON.stringify(System.char[i])),
                "class":"number"
            }

            if( line_ary.indexOf(i)!=-1 ) 
            {
                menu[i].line = {
                    "now":System.char[i],
                    "max":System.char[i+"m"]
                }
            }

            if(System.char.bonus>0)
            if( no_bonus.indexOf(i)==-1 ) 
            {
                menu[i].bonus_set = 1;
            }

        }
        menu.name.class = "";
        if(System.char.name==="")
        {
            delete menu.name.disabled;
        }
        
        
        if(System.char.exp>=System.char.expm)
        {
            menu["button2"] = {
                "type":"button",
                "value":"升級",
                "span":"",
                "event":{"click":LvUp}
            }
        }

        if(System.char.bonus>0)
        {
            menu["button3"] = {
                "type":"button",
                "value":"重新分配",
                "span":"",
                "event":{"click":function(){
                    MenuClick("char_status","open");
                }}
            }
        }

        var _btn_str = "分配點數";
        if(System.char.name==="")
            _btn_str = "決定角色名稱";

        menu["button"] = {
            "type":"button",
            "value":_btn_str,
            "span":"",
            "event":{"click":EditChar}
        }

        if(System.char.name==="")
        {
            var _div = document.createElement("div");
            _div.className = "info";
            _div.innerHTML = "請輸入角色名稱並儲存開始遊戲<BR>角色名稱日後不可更改<BR>或在【帳號管理】使用序號及繼承碼繼承已有帳號";
            div.appendChild(_div);
        }
        RowMake(menu,div,id);


        var title = {
            "0":{
                "title":"裝備",
                "html":"name"},
            "1":{
                "title":"效果",
                "html":"effect_word"}

        };

        var list = [];
        for(var key in System.char.equipment)
        {
            for(var i in System.char.equipment[key])
            {
                var idx = list.length;
                list[ idx ] = System.char.equipment[key][i];
                for(var row in System.char.equipment[key][i].effect)
                {
                    list[ idx ].effect_word = str[row] + System.char.equipment[key][i].effect[row];

                    var _parent = document.querySelector("#"+row).parentNode;
                    var _item = document.createElement("input");
                    _item.className = "number";
                    _item.disabled = "disabled";
                    _item.type = "text";
                    _item.value = System.char.equipment[key][i].effect[row];

                    if( document.querySelector("#"+row+".bonus") )
                        _parent.insertBefore(_item,document.querySelector("#"+row+".bonus"));
                    else
                        _parent.appendChild(_item);
                }
            }
        }

        var _div = document.createElement("div");
        _div.className = "info";
        _div.innerHTML = "目前裝備";
        div.appendChild(_div);
        ListMake(title,list,div,id);
    }

    if(id=="job_menu")
    {
        //JobSkillMenu(div,id);
        //JobItemMenu(div,id);
        JobMonsterMenu(div,id);
    }

    if(id=="char_list")
    {
        DB.ref("/char/").once( "value",function(_r){
            _r = _r.val();
            
            var title = {
                "0":{
                    "title":"玩家",
                    "html":"name_account"},
                "2":{
                    "title":"最後活動時間",
                    "html":"time_last_word"}
            };
            var list = [];


            for(var key in _r)
            {
                var char = _r[key];

                if(char.name==="") continue;

                var list_idx = list.length;
                
                list[ list_idx ] = char;

                list[ list_idx ]["name_account"] = 
                "【LV"+char.lv+"】<BR>【"+char.name + "】";

                list[ list_idx ]["time_last_word"] = 
                DateFormat( new Date(char.time_last) );
            }
            
            list = SortData(list,"lv",1);

            ListMake(title,list,div,id);
        });

        return;
    }

    if(id=="item")
    {
        _item = JSON.parse(JSON.stringify(System.char.item));


        DB.ref("/shop/").once("value",function(_shop){

            _shop = _shop.val();            
            
            var list = [];

            var title = {
                "0":{
                    "title":"道具名稱",
                    "html":"name_word"},
                "1":{
                    "title":"效果",
                    "html":"effect_word"},
                "2":{
                    "title":"使用",
                    "html":"use",
                    "class":"btn",
                    "id":"id",
                    "event":{"click":function(){UseItem(this.id);}}
                    }
            };

            list = [];
            for(var key in _item)
            {
                if(key=="money") continue;

                var idx = list.length;
                list[ idx ] = _item[key];
                list[ idx ].id = key;


                list[ idx ].name_word = "【"+_item[key].name+"】("+_item[key].count+")";


                if(_item[ key ].type=="item") 
                {
                    list[ idx ].name_word += "<BR>【道具】";
                    list[ idx ].use = "使用";
                }
                else if(_item[ key ].type=="material") 
                {
                    list[ idx ].name_word += "<BR>【素材】";
                    list[ idx ].use = "素材";
                }
                else if(_item[ key ].type=="equipage")
                {
                    list[ idx ].name_word += "<BR>【裝備】";
                    list[ idx ].use = "裝備";
                }



                list[ idx ].effect_word = "";
                for(var _effect in _item[key].effect)
                {
                    list[ idx ].effect_word += 
                    "【"+System.c_s_word[ _effect ]+"】"+_item[key].effect[_effect]+"<BR>";
                }


                
                System.char.equipment = System.char.equipment||{};
                if(System.char.equipment[ _item[key].type ]!==undefined)
                {
                    if( System.char.equipment[ _item[key].type ][key]!==undefined )
                        list[ idx ].use = "裝備中";
                }
            }

            var _div = document.createElement("div");
            _div.innerHTML = "持有道具";
            _div.className = "info";
            div.appendChild(_div);

            ListMake(title,list,div,id);
            div.appendChild( document.createElement("p") );


            var title = {
                "0":{
                    "title":"商品名稱",
                    "html":"name_word"},
                "1":{
                    "title":"效果",
                    "html":"effect_word"},
                "2":{
                    "title":"價錢",
                    "html":"money"},
                "3":{
                    "title":"購買",
                    "html":"buy",
                    "class":"btn",
                    "id":"id",
                    "event":{"click":function(){BuyItem(this.id);}}
                    }
            };


            list = [];
            for(var key in _shop)
            {
                var idx = list.length;
                list[ idx ] = _shop[key];
                list[ idx ]["buy"] = "購買";
                list[ idx ]["id"] = key;

                list[ idx ].name_word = "【"+_shop[key].name+"】("+_shop[key].count+")";



                if(_shop[ key ].type=="item") 
                    list[ idx ].name_word += "<BR>【道具】";
                else if(_shop[ key ].type=="material") 
                    list[ idx ].name_word += "<BR>【素材】";
                else
                    list[ idx ].name_word += "<BR>【裝備】";


                list[ idx ].effect_word = "";
                for(var _effect in _shop[key].effect)
                {
                    list[ idx ].effect_word += 
                    "【"+System.c_s_word[ _effect ]+"】"+_shop[key].effect[_effect]+"<BR>";
                }

            }
            
            var _div = document.createElement("div");
            _div.innerHTML = "商店商品";
            _div.className = "info";
            div.appendChild(_div);

            ListMake(title,list,div,id);
            div.appendChild( document.createElement("p") );


            var money_div = document.createElement("div");
            money_div.className = "info";
            money_div.innerHTML = "擁有金錢："+(_item.money);
            div.appendChild(money_div);

        
        });
    }

    if(id=="skill")
    {
        DB.ref("/skill/").once( "value",skill=>{
            skill = skill.val()||{};

            var c_skill = JSON.parse(JSON.stringify(System.char.skill||{}));

            var title = {
                "0":{
                    "title":"技能名",
                    "html":"name_word"
                    },
                "1":{
                    "title":"詳細資訊",
                    "html":"info_word"
                    },
                "2":{
                    "title":"使用狀態",
                    "html":"on_word",
                    "class":"btn",
                    "id":"id",
                    "event":{"click":function(){UseSkill(this.id);}}
                    },
                "3":{
                    "title":"傳授",
                    "html":"sold",
                    "class":"btn",
                    "id":"id",
                    "event":{"click":function(){SoldSkill(this.id);}}
                    }
            };

            var list = [];
            for(var _id in c_skill)
            {
                var idx = list.length;
                list[ idx ] = c_skill[_id];

                list[ idx ].id = _id;
                list[ idx ].sold = "傳授";

                if(c_skill[_id].on==="on")
                    list[ idx ].on_word = "準備中";
                else
                    list[ idx ].on_word = "封印中";

                

                list[ idx ].name_word = "【"+c_skill[ _id ].name+"】";

                if(c_skill[ _id ].type.active=="active") 
                    list[ idx ].name_word += "<BR>【主動】";
                
                if(c_skill[ _id ].type.active=="buff") 
                    list[ idx ].name_word += "<BR>【被動】";

                if(c_skill[ _id ].type.atk=="matk") 
                    list[ idx ].name_word += "<BR>【魔攻】";

                if(c_skill[ _id ].type.atk=="atk") 
                    list[ idx ].name_word += "<BR>【物攻】";

                list[ idx ].effect_word = "";
                for(var _effect in c_skill[ _id ].effect)
                {
                    list[ idx ].effect_word += 
                    "【"+System.c_s_word[ _effect ]+"】"+c_skill[ _id ].effect[_effect]+"<BR>";
                }

                list[ idx ].cost_word = "";
                for(var _cost in c_skill[ _id ].cost)
                {

                    list[ idx ].cost_word += "【"+ 
                    System.c_s_word[ _cost ]+"】"+c_skill[ _id ].cost[_cost]+"<BR>"
                }

                list[ idx ].need_word = "";
                for(var _need in c_skill[ _id ].need)
                {
                    list[ idx ].need_word += 
                    "【"+System.c_s_word[ _need ]+"】"+c_skill[ _id ].need[_need]+"<BR>";
                }

                list[ idx ].info_word = 
                "【效果】<BR>" + 
                list[ idx ].effect_word +
                "【消耗】<BR>" + 
                list[ idx ].cost_word + 
                "【限制】<BR>" + 
                list[ idx ].need_word;

            }

            var _div = document.createElement("div");
            _div.className = "info";
            _div.innerHTML = "擁有技能";
            div.appendChild(_div);

            ListMake(title,list,div,id);
            div.appendChild( document.createElement("p") );


            var title = {
                "0":{
                    "title":"技能名",
                    "html":"name_word"
                    },
                "1":{
                    "title":"詳細資訊",
                    "html":"info_word"
                    },
                "2":{
                    "title":"費用",
                    "html":"money"
                    },
                "3":{
                    "title":"學習",
                    "html":"getskill",
                    "class":"btn",
                    "id":"id",
                    "event":{"click":function(){BuySkill(this.id);}}
                    }
            };

            var list = [];

            System.char.skill = System.char.skill||{};

            for(var _id in skill)
            {
                if(System.char.skill[_id]!==undefined) continue;

                var idx = list.length;
                list[ idx ] = skill[_id];
            
                list[ idx ].id = _id;
                list[ idx ].getskill = "學習";

                list[ idx ].name_word = "【"+skill[ _id ].name+"】";

                if(skill[ _id ].type.active=="active") 
                    list[ idx ].name_word += "<BR>【主動】";
                
                if(skill[ _id ].type.active=="buff") 
                    list[ idx ].name_word += "<BR>【被動】";

                if(skill[ _id ].type.atk=="matk") 
                    list[ idx ].name_word += "<BR>【魔攻】";

                if(skill[ _id ].type.atk=="atk") 
                    list[ idx ].name_word += "<BR>【物攻】";

                list[ idx ].effect_word = "";
                for(var _effect in skill[ _id ].effect)
                {
                    list[ idx ].effect_word += 
                    "【"+System.c_s_word[ _effect ]+"】"+skill[ _id ].effect[_effect]+"<BR>";
                }

                list[ idx ].cost_word = "";
                for(var _cost in skill[ _id ].cost)
                {
                    list[ idx ].cost_word += "【"+
                    System.c_s_word[ _cost ]+"】"+skill[ _id ].cost[_cost]+"<BR>";
                }

                list[ idx ].need_word = "";
                for(var _need in skill[ _id ].need)
                {
                    list[ idx ].need_word += 
                    "【"+System.c_s_word[ _need ]+"】"+skill[ _id ].need[_need]+"<BR>";
                }

                list[ idx ].info_word = 
                "【效果】<BR>" + 
                list[ idx ].effect_word +
                "【消耗】<BR>" + 
                list[ idx ].cost_word + 
                "【限制】<BR>" + 
                list[ idx ].need_word;
            }



            var _div = document.createElement("div");
            _div.className = "info";
            _div.innerHTML = "可學技能清單";
            div.appendChild(_div);

            ListMake(title,list,div,id);
            div.appendChild( document.createElement("p") );

            var money_div = document.createElement("div");
            money_div.className = "info";
            money_div.innerHTML = "擁有金錢："+(System.char.item.money);
            div.appendChild(money_div);


        });
    }



    if(id=="quest")
    {
        DB.ref("/quest/").once( "value",_r=>{
            _r = _r.val();

            var title = {
                "0":{
                    "title":"地區名稱",
                    "html":"name"},
                "1":{
                    "title":"條件限制",
                    "html":"need_word"},
                "2":{
                    "title":"探索",
                    "html":"go",
                    "class":"btn",
                    "id":"id",
                    "event":{"click":function(){
                        QuestGo(this.id);
                    }}
                    }
            };

            var list = {}

            for(var _id in _r)
            {
                list[ _id ] = {};
            
                list[ _id ] = _r[_id];
                list[ _id ]["go"] = "進行探索";
                list[ _id ]["id"] = _id;

                list[ _id ].need_word = "";

                var check_need = true;
                for(var _n in list[ _id ].need)
                {
                    list[ _id ].need_word += 
                    "【"+System.c_s_word[ _n ]+"】"+list[ _id ].need[_n]+"<BR>";

                    if( System.char[_n] < list[ _id ].need[_n])
                        check_need = false;
                }

                if(check_need===false)
                {
                    list[ _id ].go = "條件不符";
                    list[ _id ].id = -1;
                }

            }

            ListMake(title,list,div,id);
        });
        return;
    }


    if(id=="battle")
    {
        var enemy = {};

        if(System.char.battle_sn!="")
        {
            DB.ref("/battle/"+System.char.battle_sn).once( "value",battle=>{

                battle = battle.val();

                if(battle==null)
                {
                    System.char.battle_sn = "";
                    DB.ref("/char/"+System.member.account).update( System.char );
                    location.reload();
                    return;
                }

                
                CheckBattleEnd(battle);

                enemy = JSON.parse(JSON.stringify(battle.enemy));
                

                var title = {
                    "0":{
                        "title":"怪物狀態",
                        "html":"name"
                    },
                    "1":{
                        "title":"",
                        "html":"status1"
                    },
                    "2":{
                        "title":"",
                        "html":"status2"
                    }
                }

                var list = [];
                list["0"] = enemy;
                list["0"].name = "【LV"+enemy.lv+"】<BR>【"+enemy.name+"】";

                list["0"].status1 = 
                "【"+System.c_s_word.hp +"】" + enemy.hp + "/" + enemy.hpm + "<BR>"+
                "【"+System.c_s_word.atk +"】"+ enemy.atk + "<BR>" + 
                "【"+System.c_s_word.def + "】"+ enemy.def + "<BR>" + 
                "【"+System.c_s_word.agi + "】"+ enemy.agi;
                
                list["0"].status2 = 
                "【"+System.c_s_word.mp +"】" + enemy.mp + "/" + enemy.mpm + "<BR>"+
                "【"+System.c_s_word.matk +"】"+ enemy.matk  + "<BR>" + 
                "【"+System.c_s_word.mdef + "】"+ enemy.mdef + "<BR>" + 
                "【"+System.c_s_word.magi + "】"+ enemy.magi;


                


                ListMake(title,list,div,id);
                div.appendChild( document.createElement("p") );

                var title = {
                    "0":{
                        "title":"玩家狀態",
                        "html":"name"
                    },
                    "1":{
                        "title":"",
                        "html":"status1"
                    },
                    "2":{
                        "title":"",
                        "html":"status2"
                    }
                }

                var list = [];
                var char = JSON.parse(JSON.stringify( System.char ));
                list["0"] = char;
                list["0"].name = "【LV"+char.lv+"】<BR>【"+char.name+"】";

                list["0"].status1 = 
                "【"+System.c_s_word.hp +"】" + char.hp + "/" + char.hpm + "<BR>"+
                "【"+System.c_s_word.atk +"】"+ char.atk + "<BR>" + 
                "【"+System.c_s_word.def + "】"+ char.def + "<BR>" + 
                "【"+System.c_s_word.agi + "】"+ char.agi;
                
                list["0"].status2 = 
                "【"+System.c_s_word.mp +"】" + char.mp + "/" + char.mpm + "<BR>"+
                "【"+System.c_s_word.matk +"】"+ char.matk  + "<BR>" + 
                "【"+System.c_s_word.mdef + "】"+ char.mdef + "<BR>" + 
                "【"+System.c_s_word.magi + "】"+ char.magi;


                
                ListMake(title,list,div,id);
                div.appendChild( document.createElement("p") );

                

                var title = [
                    {
                        "title":"攻擊",
                        "id":"sec_contdown",
                        "title_class":"btn",
                        "title_event":{"click":function(){
                            if(System.sec_contdown>0) return;
                            BattleAct("attack");
                        }}
                    }
                ];

                for(var idx in System.char.skill)
                {
                    if( System.char.skill[idx].on!=="on" ) continue;
                    
                    var _l = title.length;
                    title[ _l ] = {
                        "title":idx,
                        "id":idx,
                        "title_class":"btn",
                        "title_event":{"click":function(){
                            if(System.sec_contdown>0) return;
                            BattleAct("skill",this.id);
                        }}
                    };
                }
                var list = {};
                ListMake(title,list,div,id);


                var _line1 = document.createElement("div");
                _line1.className = "attack_line";
                _line1.innerHTML = "影響物魔攻";
                div.appendChild(_line1);
                
                clearInterval(System.attack_line.line1.timer);
                System.attack_line.line1.timer  = setInterval(function(){
                    System.attack_line.line1.value+=System.attack_line.line1.mode;
                    if(System.attack_line.line1.value>=100) 
                        System.attack_line.line1.mode=-1;
                    
                    if(System.attack_line.line1.value<=0) 
                        System.attack_line.line1.mode=1;

                        _line1.style.background = "linear-gradient(to right, #c00 "+System.attack_line.line1.value+"%, #000 0%)";
                },1);

                var _line2 = document.createElement("div");
                _line2.className = "attack_line";
                _line2.innerHTML = "影響物魔防";
                div.appendChild(_line2);
                
                clearInterval(System.attack_line.line2.timer);
                System.attack_line.line2.timer  = setInterval(function(){
                    System.attack_line.line2.value+=System.attack_line.line2.mode;
                    if(System.attack_line.line2.value>=100) 
                        System.attack_line.line2.mode=-1;
                    
                    if(System.attack_line.line2.value<=0) 
                        System.attack_line.line2.mode=1;
                    

                    _line2.style.background = "linear-gradient(to right, #0d0 "+System.attack_line.line2.value+"%, #000 0%)";
                },5);

                var _line3 = document.createElement("div");
                _line3.className = "attack_line";
                _line3.innerHTML = "影響先後攻";
                div.appendChild(_line3);
                
                clearInterval(System.attack_line.line3.timer);
                System.attack_line.line3.timer  = setInterval(function(){
                    System.attack_line.line3.value+=System.attack_line.line3.mode;
                    if(System.attack_line.line3.value>=100) 
                        System.attack_line.line3.mode=-1;
                    
                    if(System.attack_line.line3.value<=0) 
                        System.attack_line.line3.mode=1;


                    _line3.style.background = "linear-gradient(to right, #00c "+System.attack_line.line3.value+"%, #000 0%)";
                },10);


                div.appendChild( document.createElement("p") );


                var title = {
                    "0":{
                        "title":"回合",
                        "html":"turn"
                    },
                    "1":{
                        "title":"戰鬥記錄",
                        "html":"word"
                    }
                }
                
                var list = [];
                for(var idx in battle.log)
                {
                    list[idx] = {};
                    list[idx].word = battle.log[idx].word;
                    list[idx].turn = idx-(-1);
                    //list[idx].turn += "<BR>"+DateFormat( new Date(battle.log[idx].time),true );
                }
                list.reverse();


                ListMake(title,list,div,id);
                div.appendChild( document.createElement("p") );


        
            });
        }
        else
        {
            DB.ref("/battle/").once( "value",_b=>{

                battle = _b.val()||{};

                var title = {
                    "0":{
                        "title":"怪物名稱",
                        "html":"enemy_name",
                        "class":"btn",
                        "id":"id",
                        "event":{"click":function(){
                            if(confirm("確定要參戰嗎?")===false) return;

                            JoinBattle(this.id);

                        }}
                    },
                    "1":{
                        "title":"發現玩家",
                        "html":"char_start_word"
                    }
                }

                var list = [];
                for(var sn in battle)
                {
                    if(battle[sn].char_end!==undefined) continue;

                    var list_idx = list.length;

                    list[list_idx] = battle[sn];
                    list[list_idx].id = sn;

                    list[list_idx].enemy_name = "【"+battle[sn].enemy.name + "LV" + battle[sn].enemy.lv+"】<BR>【"+sn+"】";

                    list[list_idx].char_start_word = "【"+battle[sn].char_start.name+"】<BR>"+DateFormat( new Date(battle[sn].time_start),"<BR>");


                }

                list = SortData(list,"time_end");

                ListMake(title,list,div,id);



            });
        }
    }


    if(id=="battle_log")
    {
        var battle = {},
            enemy = {};

        //if(System.content!="list")
        if(System.session.menu[id].list_id!="list")
        {
            DB.ref("/battle/"+System.session.menu[id].list_id).once( "value",_b=>{
                battle = _b.val()||{};
                if(battle==null)
                {
                    System.session.menu[id].list_id = "list";
                    sessionStorage.rpg = JSON.stringify(System.session);

                    location.reload();
                    return;
                }

                enemy = battle.enemy;
                
                var title = {
                    "0":{
                        "title":"怪物狀態",
                        "html":"name"
                    },
                    "1":{
                        "title":"",
                        "html":"status1"
                    },
                    "2":{
                        "title":"",
                        "html":"status2"
                    }
                }

                var list = [];
                list["0"] = enemy;
                list["0"].name = "【LV"+enemy.lv+"】<BR>【"+enemy.name+"】";

                list["0"].status1 = 
                "【"+System.c_s_word.hp +"】" + enemy.hp + "/" + enemy.hpm + "<BR>"+
                "【"+System.c_s_word.atk +"】"+ enemy.atk + "<BR>" + 
                "【"+System.c_s_word.def + "】"+ enemy.def + "<BR>" + 
                "【"+System.c_s_word.agi + "】"+ enemy.agi;
                
                list["0"].status2 = 
                "【"+System.c_s_word.mp +"】" + enemy.mp + "/" + enemy.mpm + "<BR>"+
                "【"+System.c_s_word.matk +"】"+ enemy.matk  + "<BR>" + 
                "【"+System.c_s_word.mdef + "】"+ enemy.mdef + "<BR>" + 
                "【"+System.c_s_word.magi + "】"+ enemy.magi;
                


                var _div = document.createElement("div");
                _div.className = "info";
                _div.innerHTML = "記錄編號【"+System.session.menu[id].list_id+"】";
                div.appendChild(_div);

                var _div = document.createElement("div");
                _div.className = "info btn";
                _div.innerHTML = "回到列表";
                _div.addEventListener("click",function(){
                    
                    System.session.menu[id].list_id = "list";
                    sessionStorage.rpg = JSON.stringify(System.session);
                    MenuClick("battle_log","open");
                });
                div.appendChild(_div);
                div.appendChild( document.createElement("p") );


                ListMake(title,list,div,id);
                div.appendChild( document.createElement("p") );


                var title = {
                    "0":{
                        "title":"發現玩家",
                        "html":"char_start_word"
                    },
                    "1":{
                        "title":"最後一擊",
                        "html":"char_end_word"
                    }
                }
                
                var list = [];
                list["0"] = {};
                list["0"].char_start_word = "【LV"+battle.char_start.lv+"】<BR>【"+battle.char_start.name+"】<BR>"+DateFormat( new Date(battle.time_start),"<BR>");
                    
                list["0"].char_end_word = "【LV"+battle.char_end.lv+"】<BR>【"+battle.char_end.name+"】<BR>"+DateFormat( new Date(battle.time_end),"<BR>");



                ListMake(title,list,div,id);
                div.appendChild( document.createElement("p") );



                var title = {
                    "0":{
                        "title":"回合",
                        "html":"round"
                    },
                    "1":{
                        "title":"戰鬥記錄",
                        "html":"word"
                    }
                }
                
                var list = [];
                for(var idx in battle.log)
                {
                    list[idx] = {};
                    list[idx].word = battle.log[idx].word;
                    list[idx].round = parseInt(idx)+1;
                }

                ListMake(title,list,div,id);
                div.appendChild( document.createElement("p") );


                var title = {
                    "0":{
                        "title":"獲得經驗/道具",
                        "html":"word"}
                };

                var list = [];
                for(var key in battle.log_end[ System.member.account ] )
                {
                    if(key=="name") continue;

                    var list_idx = list.length;
                    if(key=="money")
                    {
                        list[ list_idx ] = {
                            "word":"獲得金錢【"+battle.log_end[ System.member.account ][ key ]+"】"
                        };
                    }
                    else if(key=="exp")
                    {
                        list[ list_idx ] = {
                            "word":"獲得經驗【"+battle.log_end[ System.member.account ][ key ]+"】"
                        };
                    }
                    else
                    {
                        list[ list_idx ] = {
                            "word":"獲得道具【"+key+"】"
                        };
                    }

                }
                

                ListMake(title,list,div,id);
                div.appendChild( document.createElement("p") );


            });
        }
        else
        {
            DB.ref("/battle/").once( "value",_b=>{

                battle = _b.val()||{};

                var title = {
                    "0":{
                        "title":"記錄編號",
                        "html":"id",
                        "id":"id",
                        "class":"btn",
                        "event":{"click":function(){
                            //System.content = this.id;

                            System.session.menu[id].list_id = this.id;
                            sessionStorage.rpg = JSON.stringify(System.session);

                            MenuClick("battle_log","close");
                        }}
                    },
                    "1":{
                        "title":"怪物名稱",
                        "html":"enemy_name"
                    },
                    "2":{
                        "title":"戰勝玩家",
                        "html":"char_end_word"
                    }
                }

                var list = [];
                for(var sn in battle)
                {
                    if(battle[sn].char_end===undefined) continue;
                    
                    var list_idx = list.length;

                    list[list_idx] = battle[sn];
                    list[list_idx].id = sn;

                    list[list_idx].enemy_name = "【LV" + battle[sn].enemy.lv+"】<BR>【"+battle[sn].enemy.name + "】";

                    list[list_idx].char_end_word = "【LV"+(battle[sn].char_end.lv||0)+"】<BR>【"+battle[sn].char_end.name+"】";


                    list[list_idx].during_time = battle[sn].time_start;
                    
                    list[list_idx].during_time = DateFormat( new Date(battle[sn].time_start) ) + "<BR>" + DateFormat( new Date(battle[sn].time_end) );
                }

                list = SortData(list,"time_end");


                ListMake(title,list,div,id);

            });
        }        
    }
}




function QuestGo(id)
{
    if(id==-1)
    {
        alert("探索條件不符");
        return;
    }

    if( confirm("確定要探索【"+id+"】?")===false ) return;

    var enemy = [];

    DB.ref("/battle/"+System.char.battle_sn).once( "value",battle=>{

        battle = battle.val();

        if( CheckBattleEnd(battle)==false )
        {
            alert("戰鬥尚未結束");
            return;
        }

        DB.ref("/quest/"+id).once( "value",quest=>{
            quest = quest.val();

            if(quest==null)
            {
                location.reload();
                return;
            }


            var check_need = true;
            for(var _n in quest.need)
            {
                if( System.char[_n] < quest.need[_n])
                    check_need = false;
            }

            if(check_need===false)
            {
                alert("探索條件不符");
                return;
            }


            DB.ref("/enemy/").once( "value",enemy_list=>{
                enemy_list = enemy_list.val();

                DB.ref("/char/"+ System.member.account ).once( "value",_c=>{
                    System.char = _c.val();

                    if(System.char.ap<=0)
                    {
                        alert("行動點數不足");
                        return;
                    }
                    for(var _id in enemy_list)
                    {
                        if(enemy_list[_id].quest==id)
                        {
                            if( enemy_list[_id].count===0 ) continue;

                            for(var i=0;i<enemy_list[_id].count;i++)
                                enemy.push(enemy_list[_id]);
                        }
                    }

                    Shuffle(enemy);//亂數挑出怪物

                    enemy = enemy.pop();

                    enemy.count-=1;
                    DB.ref("/enemy/"+enemy.name).update(enemy);

                    //AP減少
                    System.char.ap-=ApCal(enemy.lv,System.char.lv);
                    char.time_last = System.time + System.attack_sec;

                    battle = {};
                    battle.enemy = enemy;
                    battle.char_start = {
                        "account":System.member.account,
                        "name":System.char.name,
                        "lv":System.char.lv
                    };
                    battle.time_start = firebase.database.ServerValue.TIMESTAMP;

                    var battle_sn = System.SerialNumber.substr(0,10);

                    
                    
                    System.char.battle_sn = battle_sn;



                    DB.ref("/battle/"+battle_sn).set(battle);
                    DB.ref("/char/"+System.member.account).update(System.char);

                    MenuClick("battle","close");
                });
            });
        });


    });
}

function JoinBattle(battle_sn)
{
    DB.ref("/battle/"+battle_sn).once( "value",_b=>{

        battle = _b.val()||{};

        if(battle.char_end!==undefined)
        {
            alert("戰鬥已結束");
            location.reload();
            MenuClick("battle_log","close");
            return;
        }

        //AP減少
        System.char.ap-=ApCal(battle.enemy.lv,System.char.lv);
        

        System.char.battle_sn = battle_sn;
        DB.ref("/char/"+System.member.account).update(System.char);
        MenuClick("battle","open");
        return;
    });
}


function BattleAct(act,skill_name)
{
    var enemy = {},
        enemy_calc = {},
        char_calc = {},
        log = {"word":""},
        c_hit = 0,
        e_hit = 0,
        skill = {
            "type":{"atk":"atk","active":""},
            "on":"off",
            "name":"攻擊",
            "use_check":false
        },
        battle_end = false,
        char_dead = false;

    log.line_r = System.attack_line.line1.value;
    log.line_g = System.attack_line.line2.value;
    log.line_b = System.attack_line.line3.value;

    clearInterval(System.attack_line.line1.timer);
    clearInterval(System.attack_line.line2.timer);
    clearInterval(System.attack_line.line3.timer);
    

    DB.ref("/battle/"+System.char.battle_sn).once( "value",battle=>{

        battle = battle.val();

        if( CheckBattleEnd(battle)===true )
        {
            alert("戰鬥已結束");

            System.session.menu.battle_log.list_id = System.char.battle_sn;
            sessionStorage.rpg = JSON.stringify(System.session);
            
            MenuClick("battle_log","close");
            return;
        }


        DB.ref("/char/"+System.member.account).once( "value",char=>{
            
            char = char.val();

            if(char.hp<=0)
            {
                alert("角色死亡中，無法戰鬥");
                return;
            }


            char_calc = JSON.parse(JSON.stringify(char));


            //使用技能判斷
            if(act=="skill")
            {
                skill = JSON.parse(JSON.stringify(System.char.skill[ skill_name ]));
            }

            
            if(skill.type.active==="active" && skill.on==="on")
            {
                skill = JSON.parse(JSON.stringify(System.char.skill[ skill_name ]));

                skill.use_check = true;
                
                var need_check = true;
                for(var _n in skill.need)
                {
                    if( char_calc[_n]<skill.need[_n] )
                    {
                        need_check = false;
                        skill.use_check = false;
                    }
                }
                if(need_check===false) log["word"] += "限制件不符，技能使用失敗<BR>";

                var cost_check = true;
                for(var _c in skill.cost)
                {
                    if( char_calc[_c]<skill.cost[_c] )
                    {
                        cost_check = false;
                        skill.use_check = false;
                    }
                }
                if(cost_check===false)
                {
                    log["word"] += "消耗過量，技能使用失敗<BR>";
                
                }
                else
                {
                    //消耗魔力etc
                    for(var _c in skill.cost)
                    {
                        char[_c]-=skill.cost[_c];
                    }
                }

                if(skill.use_check===true)
                {
                    for(var _e in skill.effect)
                    {
                        char_calc[_e]+=skill.effect[_e];
                    }
                }
                else
                {
                    skill.name = "失敗的"+skill.name;
                    char_calc.atk = 0;
                    char_calc.agi = 0;
                }
            }


            char_calc.atk = Math.round( ( char_calc.atk * (log.line_r) ) / 100 );
            char_calc.matk = Math.round( ( char_calc.matk * (log.line_r) ) / 100 );
            char_calc.def = Math.round( ( char_calc.def * (log.line_g) ) / 100 );
            char_calc.mdef = Math.round( ( char_calc.mdef * (log.line_g) ) / 100 );
            char_calc.agi = Math.round( ( char_calc.agi * (log.line_b) ) / 100 );
            char_calc.magi = Math.round( ( char_calc.magi * (log.line_b) ) / 100 );


            //裝備能力加成
            for(var key in System.char.equipment)
            {
                for(var i in System.char.equipment[key])
                {
                    for(var row in System.char.equipment[key][i].effect)
                    {
                        char_calc[ row ] += System.char.equipment[key][i].effect[row];
                    }
                }
            }


            enemy = battle.enemy;
            enemy_calc = JSON.parse(JSON.stringify(enemy));

            if(log.line_r<=20)
                log["word"] += "攻擊失誤，攻擊大幅下降。<br>";
            
            if(log.line_g<=20)
                log["word"] += "防禦失誤，防禦大幅下降。<br>";

            if(log.line_b<=20)
                log["word"] += "行動失誤，敏捷大幅降低。<br>";


            if(skill.use_check===true)
            {
                if(skill.type.atk=="matk")
                {
                    char_calc.agi = char_calc.magi;
                }
            }


            var enemy_skill = [];
            for(var name in enemy.skill)
            {
                var check_skill = true;
                for(var _c in enemy.skill[name].cost)
                    if(enemy[_c]<enemy.skill[name].cost[_c]) check_skill = false;
                

                for(var _n in enemy.skill[name].need)
                    if(enemy[_n]<enemy.skill[name].need[_n]) check_skill = false;
                

                if(check_skill===true) 
                    enemy_skill.push(enemy.skill[name]);
            }
            
            Shuffle(enemy_skill);
            enemy_skill = enemy_skill.pop();


            for(var _e in enemy_skill.effect)
            {
                enemy_calc[_e]+=enemy_skill.effect[_e];
            }
            for(var _c in enemy_skill.cost)
            {
                enemy[_c]-=enemy_skill.cost[_c];
            }


            if(enemy_skill.type.atk=="matk")
            {
                enemy_calc.agi = enemy_calc.magi;
            }

            
            if(char_calc.agi>=enemy_calc.agi)//玩家先攻
            {
                c_hit = ((char_calc.atk-enemy_calc.def)>0)?char_calc.atk-enemy_calc.def:1;
                
                if(skill.type.atk=="matk" && skill.use_check===true)
                {
                    c_hit = ((char_calc.matk-enemy_calc.mdef)>0)?char_calc.matk-enemy_calc.mdef:1;
                }

                enemy.hp-=c_hit;

                log["word"] += "【"+char.name+"】【LV"+char.lv+"】發動【"+skill.name+"】，對【"+enemy.name+"】【LV"+enemy.lv+"】造成"+c_hit+"傷害。<br>";

                if(enemy.hp>0)
                {
                    e_hit = ((enemy_calc.atk-char_calc.def)>0)?enemy_calc.atk-char_calc.def:1;
                    
                    if(enemy_skill.type.atk=="matk")
                    {
                        e_hit = ((enemy_calc.matk-char_calc.mdef)>0)?enemy_calc.matk-char_calc.mdef:1;
                    }

                    char.hp-=e_hit;

                    log["word"] += "【"+enemy.name+"】【LV"+enemy.lv+"】發動【"+enemy_skill.name+"】，對【"+char.name+"】【LV"+char.lv+"】造成"+e_hit+"傷害。<br>";

                    if(char.hp<=0)
                    {
                        log["word"] += "【"+char.name+"】【LV"+char.lv+"】死亡。<br>";
                        char_dead = true;
                    }
                }
                else
                {
                    log["word"] += "【"+enemy.name+"】【LV"+enemy.lv+"】死亡，戰鬥結束。<br>";
                    battle_end = true;
                }

            }
            else
            {
                e_hit = ((enemy_calc.atk-char_calc.def)>0)?enemy_calc.atk-char_calc.def:1;

                if(enemy_skill.type.atk=="matk")
                {
                    e_hit = ((enemy_calc.matk-char_calc.mdef)>0)?enemy_calc.matk-char_calc.mdef:1;
                }

                char.hp-=e_hit;

                log["word"] += "【"+enemy.name+"】【LV"+enemy.lv+"】發動【"+enemy_skill.name+"】，對【"+char.name+"】【LV"+char.lv+"】造成"+e_hit+"傷害。<br>";

                if(char.hp>0)
                {
                    c_hit = ((char_calc.atk-enemy_calc.def)>0)?char_calc.atk-enemy_calc.def:1;

                    if(skill.type.atk=="matk" && skill.use_check===true)
                    {
                        c_hit = ((char_calc.matk-enemy_calc.mdef)>0)?char_calc.matk-enemy_calc.mdef:1;
                    }

                    enemy.hp-=c_hit;

                    log["word"] += "【"+char.name+"】【LV"+char.lv+"】發動【"+skill.name+"】，對【"+enemy.name+"】【LV"+enemy.lv+"】造成"+c_hit+"傷害。<br>";

                    if(enemy.hp<=0)
                    {
                        log["word"] += "【"+enemy.name+"】【LV"+enemy.lv+"】死亡，戰鬥結束。<br>";
                        battle_end = true;
                    }
                }
                else
                {
                    log["word"] += "【"+char.name+"】【LV"+char.lv+"】死亡。<br>";
                    char_dead = true;
                }
            }

            log.c_hit = c_hit;
            log.e_hit = e_hit;
            log.time = firebase.database.ServerValue.TIMESTAMP;
            log.line_r = System.attack_line.line1.value;
            log.line_g = System.attack_line.line2.value;
            log.line_b = System.attack_line.line3.value;


            log["char"] = {
                "account":System.member.account,
                "name":char.name,
                "lv":char.lv
            }
            

            System.battle = battle;
            System.battle.enemy = enemy;
            
            
            char.time_last = System.time;
            System.char = char;

            System.battle.log = System.battle.log||{};
            var log_idx = Object.keys(System.battle.log).length;
            System.battle.log[ log_idx ] = {};
            System.battle.log[ log_idx ] = log;




            if(battle_end==true)
            {
                //怪物死亡 結束戰鬥
                System.battle.char_end = log["char"];
                System.battle.time_end = firebase.database.ServerValue.TIMESTAMP;
            }
            
            if(char_dead==true)
            {
                //玩家戰敗死亡
                //AP減少
                System.char.ap-=ApCal(battle.enemy.lv,System.char.lv);
            }

            
            DB.ref("/battle/"+System.char.battle_sn).update(System.battle);
            DB.ref("/char/"+System.member.account).update(System.char);


            if(battle_end==true)
            {
                
                System.session.menu.battle_log.list_id = System.char.battle_sn;
                sessionStorage.rpg = JSON.stringify(System.session);

                CheckBattleEnd(System.battle);
                MenuClick("battle_log","close");
            }
            else
            {
                MenuClick("battle","open");
            }
            
        });
    });
}



function CheckBattleEnd(battle)
{
    battle = battle||{};

    //return true => 戰鬥結束
    //return false => 戰鬥未結束
    if(battle.char_end!==undefined)
    {
        //win有最後擊敗怪物的玩家帳號即為結束戰鬥 清除玩家battle_sn
        battle.log_end = {};
        for(var key in battle.log)
        {
            var log_end = battle.log_end[ battle.log[key].char.account ]||{}
            
            log_end.exp = log_end.exp||0;

            log_end.exp+=ExpCal(battle.enemy.lv,battle.log[key].char.lv,battle.log[key].c_hit);


            for(var _drop in battle.enemy.drop)
            {
                if(_drop!=="money")
                {
                    if(battle.enemy.drop[ _drop ].count>0)
                    {
                        log_end[ _drop ] = 
                            JSON.parse(JSON.stringify( battle.enemy.drop[ _drop ]));
                        
                        log_end[ _drop ].count = 1;
                    }
                }
                else
                {
                    log_end[ _drop ] = battle.enemy.drop[ _drop ];
                }
            }

            battle.log_end[ battle.log[key].char.account ] = log_end;
        }

        

        //戰鬥結束報酬 待該玩家上線觸發才分配 以battle_sn來判斷是否以領取
        //領取完battle_sn清除
        var _reward = battle.log_end[ System.member.account ];
        if(_reward!==undefined)
        {
            for(var idx in _reward)
            {
                if(idx=="money") 
                {
                    System.char.item.money+=_reward.money;
                }
                else if(idx=="exp")
                {
                    System.char.exp+=_reward.exp;
                }
                else
                {
                    battle.enemy.drop[ idx ].count-=1;

                    if(System.char.item[idx]!==undefined)
                    {
                        System.char.item[idx].count+=1;
                    }
                    else
                    {
                        System.char.item[idx] = _reward[idx];
                    }
                }
            }
        }
        console.log(battle);
        console.log(System.char);
        
        DB.ref("/battle/"+System.char.battle_sn).update(battle);
        System.char.battle_sn = "";
        DB.ref("/char/"+System.member.account).update( System.char );

        return true;
    }

    if(battle.enemy!==undefined)
    {
        return false;
    }
    else
    {
        return true;
    }
}

function UseItem(id)
{
    if( confirm("確定要使用/裝備嗎?")===false ) return;

    _item = System.char.item[id];

    if(_item===null || _item===undefined) return;

    if(_item.type=="item")
    {
        _item.count-=1;

        for(var key in _item.effect)
        {            
            System.char[ key ]+= _item.effect[key];

            if(System.char[key+"m"]!==undefined)
            {
                if( System.char[key] > System.char[key+"m"] )
                {
                    System.char[key] = System.char[key+"m"];
                }
            }
        }

        if(_item.count<=0)
        {
            delete System.char.item[id];
        }

    }
    else if(_item.type=="material")
    {
        return;
    }
    else
    {
        //裝備type!=item
        if(System.char.equipment[ _item.type ]!==undefined)
        {
            delete System.char.equipment[ _item.type ];
        }
        else
        {
            System.char.equipment = System.char.equipment||{};
            System.char.equipment[ _item.type ] = System.char.equipment[ _item.type ]||{};
            System.char.equipment[ _item.type ][ id ] = _item;
        }            
    }


    DB.ref("/char/"+System.member.account).set( System.char );

    MenuClick("item","open");
}


function UseSkill(id)
{
    var skill = System.char.skill[id];

    skill.on = (skill.on==="on")?"off":"on";

    MenuClick("skill","open");

    DB.ref("/char/"+System.member.account).set( System.char );
}



function BuyItem(id)
{
    if(confirm("確定要購買嗎?")===false) return;
    

    DB.ref("/shop/"+id).once("value",function(_shop){
        _shop = _shop.val();

        DB.ref("/char/"+System.member.account).once("value",function(char){

            System.char = char.val();

            _item = System.char.item;

            if(_shop==null) return;

            if(_shop.count<=0)
            {
                alert("商品數量不足");
                return;
            }

            if(_shop.money>_item.money)
            {
                alert("金錢不足");
                return;
            }

            _shop.count-=1;
            _item.money-=_shop.money;


            if(_item[ id ]!=undefined)
            {
                _item[ id ].count+=1;
            }
            else
            {
                _item[ id ] = JSON.parse(JSON.stringify(_shop));
                _item[ id ].count = 1;
            }


            DB.ref("/shop/"+id).update( _shop )
            DB.ref("/char/"+System.member.account).update( System.char );

            
            MenuClick("item","open");
        });
    });
}

function BuySkill(id)
{
    if(confirm("確定要學習【"+id+"】嗎?")===false) return;

    DB.ref("/skill/"+id).once("value",function(_skill){
        _skill = _skill.val();

        DB.ref("/char/"+System.member.account).once("value",function(char){

            char = char.val();
            char.skill = char.skill||{};

            if(char.skill[id]!==undefined)
            {
                alert("已學習【"+id+"】");
                return;
            }

            if(_skill.money>System.char.item.money)
            {
                alert("金錢不足");
                return;
            }
            if(_skill.count<=0)
            {
                alert("技能持有者已達上限");
                return;
            }

            System.char.item.money-=_skill.money;
            
            System.char.skill = System.char.skill||{};
            System.char.skill[ id ] = JSON.parse(JSON.stringify(_skill));
            System.char.skill[ id ].count = 1;

            _skill.count-=1;


            DB.ref("/skill/"+id).update( _skill );
            DB.ref("/char/"+System.member.account).update( System.char );

            MenuClick("skill","open");
        });
    });
}

function SoldSkill(id)
{
    if(confirm("確定要傳授【"+id+"】嗎?")===false) return;

    DB.ref("/skill/"+id).once("value",function(_skill){
        _skill = _skill.val();

        DB.ref("/char/"+System.member.account).once("value",function(char){

            char = char.val();

            if(char.skill[id]===undefined)
            {
                alert("無【"+id+"】可傳授");
                return;
            }
            

            System.char.item.money+=_skill.money;
            
            delete System.char.skill[ id ];
            
            _skill.count+=1;

            DB.ref("/skill/"+id).update( _skill );
            DB.ref("/char/"+System.member.account).update( System.char );

            MenuClick("skill","open");
        });
    });
}





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

            for(var e_type in title[row].event)
            {
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


//menu=>obj,div=>div容器
function RowMake(menu,div,id)
{
    for(var i in menu)
    {
        var input = document.createElement("input");
        var span = document.createElement("span");

        if(menu[i].html!=undefined && menu[i].html!="")
        {
            input = menu[i].html;
        }

        input.id = i;

        for(var attr in menu[i])
        {
            if( typeof(menu[i][attr])=="object" ) continue;

            input.setAttribute(attr,menu[i][attr]);
        } 
        
        span.innerHTML = menu[i].span||"";

        if(menu[i].event!==undefined)
        {
            for(var _on in menu[i].event)
                input.addEventListener(_on,menu[i].event[_on]);
        }

        if(menu[i].line!==undefined)
        {
            input = document.createElement("div");
            input.className = "line";
            input.id = i;

            var percent = Math.floor( (menu[i].line.now * 100/menu[i].line.max)<0?0:(menu[i].line.now * 100/menu[i].line.max) );

            input.style.background = "linear-gradient(to right, #0f0 "+percent+"%, #fff 0%)";

            input.innerHTML = menu[i].line.now + "/" + menu[i].line.max;
        }
        
        

        var row_div = document.createElement("div");
        row_div.className = "row";

        row_div.appendChild(span);
        row_div.appendChild(input);

        if(menu[i].bonus_set==1)
        {
            BonusSet(row_div,i);
        }

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


function BonusSet(row_div,i)
{
    var bonus_set = document.createElement("input");
    bonus_set.className = "bonus"
    bonus_set.value = "↑";
    bonus_set.type = "button";
    bonus_set.id = i;
    bonus_set.addEventListener("click",function(){

        var _id = this.id;

        if(System.char_bonus_set.bonus<=0) return;

        System.char_bonus_set.bonus-=1;
        document.querySelector("#bonus").value = System.char_bonus_set.bonus;

        
        if(_id=="hp" || _id=="mp")
        {
            var line_div = document.querySelector("#"+_id);

            if(_id=="hp")
                line_div.innerHTML = 
                (System.char_bonus_set[_id]-=(-2)) + "/" + 
                (System.char_bonus_set[_id+"m"]-=(-2));
            
            if(_id=="mp")
                line_div.innerHTML = 
                (System.char_bonus_set[_id]-=(-1)) + "/" + 
                (System.char_bonus_set[_id+"m"]-=(-1));
            

            var percent = Math.floor( (System.char_bonus_set[_id] * 100/System.char_bonus_set[_id+"m"])<0?0:(System.char_bonus_set[_id] * 100/System.char_bonus_set[_id+"m"]) );

            line_div.style.background = "linear-gradient(to right, #0f0 "+percent+"%, #fff 0%)";
        }
        else
        {
            System.char_bonus_set[_id]-=(-1);
            document.querySelector("#"+_id).value = System.char_bonus_set[_id];
        }
    });

    row_div.appendChild(bonus_set);
}


function RegisterMember()
{
    var new_member = {};
    new_member.account = System.SerialNumber;
    new_member.password = btoa( P(System.SerialNumber) );
    new_member.time_register = firebase.database.ServerValue.TIMESTAMP;
    new_member.time_last = firebase.database.ServerValue.TIMESTAMP;

    System.member = new_member;

    var _localStorage = JSON.parse(localStorage.kfs||'{}');
    _localStorage.rpg = System.member;
    localStorage.kfs = JSON.stringify(_localStorage);

    DB.ref("/member/"+new_member.account).set( new_member );

}

function CreateChar()
{
    System.char_default.time_last = firebase.database.ServerValue.TIMESTAMP;
    DB.ref("/char/"+System.member.account).set( System.char_default );
    

    System.char = System.char_default;
}



function EditChar()
{
    if(System.char.name!=="")
    {
        if(confirm("確定要進行點數分配?")===false) return;
    }

    DB.ref("/char/").once( "value",function(_r){
        _r = _r.val();

        if(System.char.name==="")
        {
            for(var idx in _r)
            {
                if(_r[idx].name===document.querySelector("#name").value || 
                document.querySelector("#name").value==="")
                {
                    alert("角色名稱已有人使用及不可空白");
                    return;
                }
            }
        }

        System.char = System.char_bonus_set;

        var old_name = System.char.name;

        System.char.name = document.querySelector("#name").value;

        DB.ref("/char/"+System.member.account).update( System.char );

        
        if(old_name!==document.querySelector("#name").value)
        {
            alert("命名完成");
            location.reload();
            return;
        }
        
        MenuClick("char_status","open");

    });
}

function LvUp()
{
    if(System.char.exp<System.char.expm) return;

    DB.ref("/char/"+ System.member.account ).once( "value",_c=>{
        
        System.char = _c.val();

        System.char.exp-=System.char.expm;
        System.char.lv+=1;
        System.char.expm = parseInt(System.char.lv*System.char.lv*1.5);

        System.char.hpm+=2;
        System.char.hp+=2;
        System.char.mpm+=1;
        System.char.mp+=1;

        System.char.atk+=2;
        System.char.matk+=1;

        System.char.def+=2;
        System.char.mdef+=1;

        System.char.agi+=1;

        System.char.bonus+=System.char.lv;

        DB.ref("/char/"+ System.member.account ).update( System.char );

        alert("升級成功");
        MenuClick("char_status","open");
    });
    
}


function DelAccount()
{
    if( confirm("確定要清除帳號資料嗎?")===false ) return;
    

    if( System.member.account!==prompt("請輸入帳號序號進行程序") ) return;
    

    if( confirm("注意!重置程序無法恢復資料,確定要繼續嗎?")===false ) return;
    


    var _localStorage = JSON.parse(localStorage.kfs||'{}');
    delete _localStorage.rpg;
    localStorage.kfs = JSON.stringify(_localStorage);
    
    DB.ref("/char/"+System.member.account).update( {"name":""} );

    alert("清除完成");
    location.reload();
    return;
}


function OldAccount()
{
    var a = document.querySelector("input#account");
    var p = document.querySelector("input#password");    

    if(a.value!=="" && p.value!=="")
    {
        DB.ref("/member/"+a.value).once( "value",_m=>{
            _m = _m.val();

            if(_m!==null && a.value!==System.member.account)
            {
                if(p.value===_m.password)
                {
                    System.member = _m;

                    var _localStorage = JSON.parse(localStorage.kfs||'{}');
                    _localStorage.rpg = System.member;
                    localStorage.kfs = JSON.stringify(_localStorage);

                    alert("繼承完成");
                    location.reload();
                    return;
                }
            }
            else
            {
                a.value = "";
                p.value = "";

                a.disabled = "";
                p.disabled = "";
                return;
            }

            if(a.disabled===false && p.disabled===false)
            {
                a.value = "";
                p.value = "";
                alert("序號/繼承碼錯誤");
            }
        });
    }
}

function EditAccount()
{
    var a = document.querySelector("input#account");
    var p = document.querySelector("input#password"); 

    System.member.password = btoa( P(System.SerialNumber) );

    a.value = System.member.account;
    p.value = System.member.password;
    a.disabled = "disabled";
    p.disabled = "disabled";

    DB.ref("/member/"+System.member.account).update( System.member );
}



function ServerTime()
{
    firebase.database().ref('/').update({"ServerTime":firebase.database.ServerValue.TIMESTAMP})
    .then(function (data) {
      firebase.database().ref('/')
        .once('value')
        .then(function (data) {
            System.time = data.val();
            System.time = System.time.ServerTime;

            clearInterval(System._timer);

          System._timer = setInterval(function(){

            
            System.sec_contdown = System.attack_sec - Math.ceil( (System.time - System.char.time_last)/1000);

            if(document.querySelector("#sec_contdown"))
            {
                if(System.sec_contdown<1)
                    document.querySelector("#sec_contdown").innerHTML = "攻擊";
                else
                    document.querySelector("#sec_contdown").innerHTML = System.sec_contdown;
            }

            System.time+=500;
            if(document.querySelector("#Time"))
            {
                document.querySelector("#Time").innerHTML = 
                "【"+DateFormat(new Date(System.time))+"】【"+System.char.ap + " / 100】";

            }

            System.SerialNumber = System.time.toString().substr(1);
          },500);
        

          setTimeout(function(){
            document.querySelector("div#Mask").className = "off";
            
            setTimeout(function(){
                document.querySelector("div#Mask").style.display = "none";
                document.body.className = "";
            },500);
            
          },100);
          

          console.log('server time: ', System.time);
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

//經驗倍率計算 依怪物角色等級去增減
function ExpCal(e_lv,c_lv,exp)
{
    var _lv = e_lv / c_lv;
    if(_lv>3) _lv = 3;
    if(_lv<0.2) _lv = 0.2;
    exp = (Math.round(exp * _lv)<1)?1:Math.round(exp * _lv);

    return exp;
}

//AP減少公式
function ApCal(e_lv,c_lv)
{
    var _ap = ((c_lv - e_lv)<1)?1:(c_lv - e_lv);

    return _ap;
}

function ApHpMp(sec)
{
    System.char.hp+=Math.floor(sec/60 * 10);
    System.char.mp+=Math.floor(sec/60 * 20);
    System.char.ap+=Math.floor(sec/60 * 5);

    if(System.char.hp>System.char.hpm) System.char.hp = System.char.hpm;
    if(System.char.mp>System.char.mpm) System.char.mp = System.char.mpm;
    if(System.char.ap>100) System.char.ap = 100;

}


function CheckMobile()
{//true手機行動裝置 false非手機
    return (navigator.userAgent.indexOf("Mobile")!==-1)?true:false;
}

/*
DB.ref("/GAMEROOM/"+_game_room.ID).set(_game_room);
DB.ref("/PLAYER/"+ GLOBAL.session_user.nick_name ).update( _player );
DB.ref("/system/config").once( "value",_sys=>{System.config = _sys.val();});
*/

/*

取得玩家IP
https://ipinfo.io/
https://ipinfo.io/?callback=callback
GOOGLE get ip address api

*/



