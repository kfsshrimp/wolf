function JobMonsterMenu(div,id)
{
    var _div = document.createElement("div");
    _div.className = "info";
    _div.innerHTML = "怪物研究";
    div.appendChild(_div);

    var quest_select = document.createElement("select");
    quest_select.id = "monster_quest";

    DB.ref("/quest").once( "value",quest=>{ 

        quest = quest.val();

        for(var key in quest)
        {
            quest_select.innerHTML += 
                "<option>"+quest[key].name+"</option>";
        }
        

    }).then(function(){
        
        var menu = {};
        var str = System.c_s_word;
        var _pass = ["exp","bonus"];


        menu["monster_quest"] = {
            "type":"text",
            "id":"monster_quest",
            "value":"",
            "span":"出現地區",
            "html":quest_select
        }


        for(var i in System.char_default)
        {
            if(str[i]===undefined) continue;
            if(_pass.indexOf(i)!=-1) continue;


            menu[ "monster_" + i ] = {
                "type":"text",
                "span":str[i],
                "value":"",
                "class":"number"
            }
        }
        menu.monster_name.class = "";
        menu.monster_name.span = "怪物名稱";

        menu.monster_count = {
            "type":"text",
            "span":"怪物數量",
            "value":"",
            "class":"number"
        };


        var skill_select = {
            "skill_effect":"效果",
            "skill_cost":"消耗",
            "skill_need":"限制"
        };


        menu.monster_skill = {
            "type":"text",
            "span":"怪獸技能",
            "html":OptionMake(
                {
                    "id":"monster_skill",
                    "ul_id":"monster_skill",
                    "type":"button",
                    "value":"新增",
                    "class":"number",
                    "event":{"click":function() {
                        
                        var _ul = document.querySelector("ul#monster_skill");
                        
                        var _li = document.createElement("li")
                        _ul.appendChild(_li);

                        var span = document.createElement("span");
                        span.innerHTML = "技能名稱";
                        _li.appendChild( span );

                        var input = document.createElement("input");
                        input.id = "skill_name";
                        input.type = "text";
                        _li.appendChild( input );

                        _li.appendChild( document.createElement("BR") );

                        var span = document.createElement("span");
                        span.innerHTML = "屬性";
                        _li.appendChild( span );

                        var skill_atk = document.createElement("select");
                        skill_atk.id = "skill_type_atk";
                        skill_atk.innerHTML = "<option value=matk>魔攻</option><option value=atk>物攻</option>";
                    
                        _li.appendChild( skill_atk );
                        _li.appendChild( document.createElement("BR") );


                        var span = document.createElement("span");
                        span.innerHTML = "類型";
                        _li.appendChild( span );

                        var skill_active = document.createElement("select");
                        skill_active.id = "skill_type_active";
                        skill_active.innerHTML = "<option value=active>主動</option><option value=buff>被動</option>";

                        _li.appendChild( skill_active );
                        _li.appendChild( document.createElement("BR") );
                        

                        var li_idx = document.querySelectorAll("#monster_skill li").length-1;

                        for(var _id in skill_select)
                        {
                            var option_char = document.createElement("select");
                            option_char.id = _id;
                            for(var key in System[_id])
                            {
                                option_char.innerHTML += 
                                    "<option value="+key+">"+System[_id][key]+"</option>";
                            }

                            var span = document.createElement("span");
                            span.innerHTML = skill_select[_id];
                            _li.appendChild( span );
                            

                            OptionMake(
                                {
                                    "id":_id,
                                    "ul_id":"monster_skill",
                                    "type":"text",
                                    "class":"number",
                                    "value":"",
                                    "html":option_char
                                }, li_idx
                            );

                            OptionMake(
                                {
                                    "id":_id,
                                    "ul_id":"monster_skill",
                                    "type":"text",
                                    "class":"number"
                                }, li_idx
                            );

                            document.querySelectorAll("ul#monster_skill li")[li_idx].appendChild( document.createElement("BR") );
                        }


                        for(var _id in System.session.menu)
                        {
                            if( System.session.menu[_id].open=="open" )
                            {
                                document.querySelector("div#"+_id).style.height = document.querySelector("div#"+_id+" div#Main").clientHeight + "px";
                            }
                        }


                    }}
                }
            )
        };

        menu["button"] = {
            "type":"button",
            "value":"研究成果",
            "span":"",
            "event":{"click":function(){CreateMonster();}}
        }


        RowMake(menu,div,id);

        document.querySelectorAll("#Menu ul>div").forEach(function(div,idx){
            div.innerHTML = "";
        });
        document.querySelector("div#"+id).appendChild(div);

        setTimeout(function(){
            document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
        },0);
    });

}



function JobSkillMenu(div,id)
{
    var _div = document.createElement("div");
    _div.className = "info";
    _div.innerHTML = "技能開發";
    div.appendChild(_div);

    var skill_atk = document.createElement("select");
    skill_atk.innerHTML = "<option value=matk>魔攻</option><option value=atk>物攻</option>";

    var skill_active = document.createElement("select");
    skill_active.innerHTML = "<option value=active>主動</option><option value=buff>被動</option>";


    var menu = {
        "skill_name":{
            "type":"text",
            "span":"名稱",
            "value":""
        },
        "skill_count":{
            "type":"text",
            "span":"學習人數上限",
            "class":"number",
            "value":""
        },
        "skill_money":{
            "type":"text",
            "span":"費用",
            "class":"number",
            "value":""
        },
        "skill_type.atk":{
            "type":"text",
            "span":"屬性",
            "value":"",
            "html":skill_atk
        },
        "skill_type.active":{
            "type":"text",
            "span":"類型",
            "value":"",
            "html":skill_active
        }
    }


    var skill_select = {
        "skill_effect":"效果",
        "skill_cost":"消耗",
        "skill_need":"限制"
    }
    for(var _id in skill_select)
    {
        menu[ _id ] = {
            "type":"text",
            "span":skill_select[_id],
            "value":"",
            "html":OptionMake( 
                {
                    "ul_id":_id,
                    "id":_id,
                    "type":"button",
                    "value":"新增",
                    "event":{"click":function(){

                        var option_char = document.createElement("select");
                        option_char.id = _id;
                        for(var key in System[this.id])
                        {
                            option_char.innerHTML += 
                                "<option value="+key+">"+System[this.id][key]+"</option>";
                        }

                        var li_idx = document.querySelectorAll("#"+this.id+" li").length;

                        OptionMake(
                            {
                                "id":this.id,
                                "ul_id":this.id,
                                "type":"text",
                                "class":"number",
                                "value":"",
                                "html":option_char
                            }, li_idx
                        );

                        OptionMake(
                            {
                                "id":this.id,
                                "ul_id":this.id,
                                "type":"text",
                                "class":"number"
                            }, li_idx
                        );
                    }}
                }
            )
        }
    }

    menu["button"] = {
        "type":"button",
        "value":"開發技能",
        "span":"",
        "event":{"click":function(){CreateSkillItem("skill");}}
    }



    RowMake(menu,div,id);

    document.querySelectorAll("#Menu ul>div").forEach(function(div,idx){
        div.innerHTML = "";
    });
    document.querySelector("div#"+id).appendChild(div);

    setTimeout(function(){
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);
}






function JobItemMenu(div,id)
{
    var _div = document.createElement("div");
    _div.className = "info";
    _div.innerHTML = "道具鍛造";
    div.appendChild(_div);

    var item_type = document.createElement("select");
    item_type.innerHTML = "<option value=item>道具</option><option value=equipage>裝備</option>";

    item_type.addEventListener("change",function(){
        
        document.querySelectorAll("select#skill_effect").forEach(function(obj){
            obj.parentElement.remove();    
        });

    });

    var item_atk = document.createElement("select");
    item_atk.innerHTML = "<option value=matk>魔攻</option><option value=atk>物攻</option>";

    var menu = {
        "item_name":{
            "type":"text",
            "span":"名稱",
            "value":""
        },
        "item_count":{
            "type":"text",
            "span":"數量",
            "disabled":"disabled",
            "class":"number",
            "value":"1"
        },
        "item_money":{
            "type":"text",
            "span":"費用",
            "class":"number",
            "value":""
        },
        "item_type":{
            "type":"text",
            "span":"類型",
            "value":"",
            "html":item_type
        },
        "item_atk":{
            "type":"text",
            "span":"屬性",
            "value":"",
            "html":item_atk
        }
    }


    var item_select = {
        "skill_effect":"效果",
        //"skill_cost":"消耗",
        "skill_need":"限制"
    }
    for(var _id in item_select)
    {
        menu[ _id ] = {
            "type":"text",
            "span":item_select[_id],
            "value":"",
            "html":OptionMake( 
                {
                    "ul_id":_id,
                    "id":_id,
                    "type":"button",
                    "value":"新增",
                    "event":{"click":function(){

                        var option_char = document.createElement("select");
                        option_char.id = _id;


                        if(document.querySelector("#item_type").value=="item")
                        {
                            for(var key in System.skill_cost)
                            {
                                option_char.innerHTML += 
                                    "<option value="+key+">"+System.skill_cost[key]+"</option>";
                            }
                        }
                        else
                        {
                            for(var key in System[this.id])
                            {
                                option_char.innerHTML += 
                                    "<option value="+key+">"+System[this.id][key]+"</option>";
                            }
                        }
                        

                        var li_idx = document.querySelectorAll("#"+this.id+" li").length;

                        OptionMake(
                            {
                                "id":this.id,
                                "ul_id":this.id,
                                "type":"text",
                                "class":"number",
                                "value":"",
                                "html":option_char
                            }, li_idx
                        );

                        OptionMake(
                            {
                                "id":this.id,
                                "ul_id":this.id,
                                "type":"text",
                                "class":"number"
                            }, li_idx
                        );
                    }}
                }
            )
        }
    }

    menu["button"] = {
        "type":"button",
        "value":"鍛造道具",
        "span":"",
        "event":{"click":function(){CreateSkillItem("shop");}}
    }



    RowMake(menu,div,id);

    document.querySelectorAll("#Menu ul>div").forEach(function(div,idx){
        div.innerHTML = "";
    });
    document.querySelector("div#"+id).appendChild(div);

    setTimeout(function(){
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);
}












function OptionMake( option , li_idx = -1 )
{
    var input = document.createElement("input");


    if(option.html!=undefined && option.html!="")
    {
        input = option.html;
    }
    
    

    for(var attr in option)
    {
        if( typeof(option[attr])=="object" ) continue;

        input.setAttribute(attr,option[attr]);
    }

    if(option.event!==undefined)
    {
        for(var _on in option.event)
            input.addEventListener(_on,option.event[_on]);
    }

    


    var _ul = document.querySelector("#"+option.ul_id);
    var _li = document.createElement("li");

    if(li_idx!=-1)
    {
        if(_ul.querySelectorAll("li")[ li_idx ]==null) _ul.appendChild(_li);

        _li = _ul.querySelectorAll("li")[ li_idx ];
    }


    if(_ul==null)
    {
        _ul = document.createElement("ul");
        _ul.id = option.ul_id;
        

        _li.appendChild(input);
        _ul.appendChild(_li);

        return _ul;
    }
    else
    {
        if(li_idx!=-1)
        {
            _li.appendChild(input);
        }
        else
        {
            _li.appendChild(input);
            _ul.appendChild(_li);
        }

        for(var _id in System.session.menu)
        {
            if( System.session.menu[_id].open=="open" )
            {
                document.querySelector("div#"+_id).style.height = document.querySelector("div#"+_id+" div#Main").clientHeight + "px";
            }
        }
        

    }
}


function CreateSkillItem(mode)
{
    var new_data = {};
    var key_ary = {};
    var val_ary = {};
    
    var _key_ary = ["effect","cost","need"];

    document.querySelectorAll("input[type=text]").forEach(function(obj){
        console.log(obj.id + "=>" +obj.value);

        var _key = obj.id.split("_");

        if(_key_ary.indexOf(_key[1])!=-1)
        {
            new_data[ _key[1] ] = new_data[ _key[1] ]||{};
            val_ary[ _key[1] ] = val_ary[ _key[1] ]||[];

            val_ary[ _key[1] ].push( obj.value );
        }
        else
        {
            if(_key[1].split(".").length>1)
            {
                new_data[ _key[1].split(".")[0] ] = new_data[ _key[1].split(".")[0] ]||{};
                new_data[ _key[1].split(".")[0] ][ _key[1].split(".")[1] ] = obj.value;
            }
            else
            {
                new_data[ _key[1] ] = obj.value;
            }
        }
        

        
    });
    
    document.querySelectorAll("select").forEach(function(obj){
        console.log(obj.id + "=>" +obj.value);

        var _key = obj.id.split("_");

        if(_key_ary.indexOf(_key[1])!=-1)
        {
            new_data[ _key[1] ] = new_data[ _key[1] ]||{};

            key_ary[ _key[1] ] = key_ary[ _key[1] ]||[];

            key_ary[ _key[1] ].push( obj.value );

        }
        else
        {
            if(_key[1].split(".").length>1)
            {
                new_data[ _key[1].split(".")[0] ] = new_data[ _key[1].split(".")[0] ]||{};
                new_data[ _key[1].split(".")[0] ][ _key[1].split(".")[1] ] = obj.value;
            }
            else
            {
                new_data[ _key[1] ] = obj.value;
            }
        }
    });

    for(var key in key_ary)
    for(var val in val_ary)
    {
        if(key==val)
        {
            for(var x in key_ary[key])
                new_data[ key ][ key_ary[key] ] = val_ary[val][x];
        }
    }


    new_data.char_create = {
        "account":System.member.account,
        "name":System.char.name,
        "time":firebase.database.ServerValue.TIMESTAMP
    };
    new_data.char_update = {
        "account":System.member.account,
        "name":System.char.name,
        "time":firebase.database.ServerValue.TIMESTAMP
    }

    new_data.on = "off";


    DB.ref("/"+mode+"/"+ new_data.name ).once( "value",_data=>{

        _data = _data.val();

        var _word = "開發";
        if(mode!="skill") _word = "鍛造";

        if(_data==null)
        {
            DB.ref("/"+mode+"/"+ new_data.name).set( new_data );
        }
        else
        {
            if(!_data.char_create)
            {
                alert(_word+"失敗");
                return;
            }
            if(_data.char_create.account!=System.member.account)
            {
                alert(_word+"失敗");
                return;
            }

            DB.ref("/"+mode+"/"+ new_data.name).update( new_data );
        }

        alert(_word+"成功");
    });
}




function CreateMonster()
{
    var new_data = {};
    var key_ary = {};
    var val_ary = {};
    var skill_ary = [];

    var skill_ary_name_idx = 0;
    var skill_ary_type_idx = 0;

    document.querySelectorAll("input[type=text]").forEach(function(obj){
        //console.log(obj.id + "=>" +obj.value);

        var _key = obj.id.split("_");

        if(_key[0]=="skill")
        {
            if(_key[1]=="name")
            {
                skill_ary[ skill_ary_name_idx ] = skill_ary[ skill_ary_name_idx ]||{};

                skill_ary[ skill_ary_name_idx ].name = obj.value;

                skill_ary_name_idx++;
            }
            else
            {
                val_ary[ _key[1] ] = val_ary[ _key[1] ]||[];
                val_ary[ _key[1] ].push( obj.value );
            }

            
        }
        else
        {
            if(_key[1].split(".").length>1)
            {
                new_data[ _key[1].split(".")[0] ] = new_data[ _key[1].split(".")[0] ]||{};
                new_data[ _key[1].split(".")[0] ][ _key[1].split(".")[1] ] = obj.value;
            }
            else
            {
                new_data[ _key[1] ] = obj.value;
            }
        }
        
    });
    
    document.querySelectorAll("select").forEach(function(obj){
        //console.log(obj.id + "=>" +obj.value);

        var _key = obj.id.split("_");

        if(_key[0]=="skill")
        {
            if(_key[1]=="type")
            {
                skill_ary[ skill_ary_type_idx ][ _key[2] ] = obj.value;

                if(skill_ary[ skill_ary_type_idx ].atk!=undefined && 
                    skill_ary[ skill_ary_type_idx ].active!=undefined)
                {
                    skill_ary_type_idx++;
                }

            }
            else
            {
                key_ary[ _key[1] ] = key_ary[ _key[1] ]||[];
                key_ary[ _key[1] ].push( obj.value );
            }

        }
        else
        {
            if(_key[1].split(".").length>1)
            {
                new_data[ _key[1].split(".")[0] ] = new_data[ _key[1].split(".")[0] ]||{};
                new_data[ _key[1].split(".")[0] ][ _key[1].split(".")[1] ] = obj.value;
            }
            else
            {
                new_data[ _key[1] ] = obj.value;
            }
        }
    });

    for(var key in key_ary)
    for(var val in val_ary)
    {
        if(key==val)
        {
            //for(var x in key_ary[key])
            //    new_data[ key ][ key_ary[key] ] = val_ary[val][x];
        }
    }


    new_data.hpm = new_data.hp;
    new_data.mpm = new_data.mp;

    new_data.char_create = {
        "account":System.member.account,
        "name":System.char.name,
        "time":firebase.database.ServerValue.TIMESTAMP
    };
    new_data.char_update = {
        "account":System.member.account,
        "name":System.char.name,
        "time":firebase.database.ServerValue.TIMESTAMP
    }
    
    console.log( val_ary );
    console.log( key_ary );
    console.log( skill_ary );
    
    var skill = {};
    var skill_idx = 0;

    for(var key in skill_ary)
    {
        skill[ skill_ary[key].name ] = {};

        skill[ skill_ary[key].name ].type = {
            "atk":skill_ary[key].atk,
            "active":skill_ary[key].active,
        };

        for(var _idx in key_ary)
        {
            skill[ skill_ary[key].name ][ key_ary[_idx][ skill_idx ] ] = 
            val_ary[_idx][ skill_idx ];
        }
        skill_idx++;
    }

    //console.log(skill);
    
    //console.log(new_data);

    new_data.skill = skill;


    DB.ref("/enemy/"+ new_data.name ).once( "value",_data=>{

        _data = _data.val();


        if(_data==null)
        {
            DB.ref("/enemy/"+ new_data.name).set( new_data );
        }
        else
        {
            if(!_data.char_create)
            {
                alert("研究失敗");
                return;
            }
            if(_data.char_create.account!=System.member.account)
            {
                alert("研究失敗");
                return;
            }

            DB.ref("/enemy/"+ new_data.name).update( new_data );
        }

        alert("研究成功");
    });
}