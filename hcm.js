//strings
var str_startWork = "Послать на работу";
var str_stoptWork = "Остановить работу";
var str_startLevelUP = "Послать на кач";
var str_stoptLevelUP = "Остановить кач";

function log_message(msg, isError)
{
	var status = "[DEBUG] ";
	if(isError === true)
	{
		status = "[ERROR] ";
	}
	$("#logBox").append("<!--"+status+msg+"-->\n");
	//refreshSnapshotsList();
}

var etPlayerActivites = 
{
	IDLE: 0,
	LEVELUP: 2,
	MINE: 3,
	CRAFT: 4
}

var etPlayerprofessions = 
{
	FREE: 0,
	MINER: 1

}

var newPlayerCost = 100;

class player
{
    constructor(id)
    {
		this.name = strLib.getNextName();
		this.lvl = 6;  
		this.activity = etPlayerActivites.IDLE;  
		this.profession = etPlayerprofessions.FREE;
		this.id = id;
    }

    buildHtml()
    {
    	var idPrefix = "playerLine_"+this.id+"_";
    	var blockClass = "playerLine playerLineIdle";
    	if(this.activity == etPlayerActivites.LEVELUP)
    	{
    		blockClass = "playerLine  playerLineLUP";
    	}
    	else if(this.activity != etPlayerActivites.IDLE)
    	{
    		blockClass = "playerLine playerLineActive";
    	}

    	//set btn labels
    	var jorkBtnLabel = str_startWork;
    	var levelUpBtnLabel = str_startLevelUP;
		if(this.activity == etPlayerActivites.MINE)
		{
			jorkBtnLabel = str_stoptWork;
		}
		else if(this.activity == etPlayerActivites.LEVELUP)
		{
			levelUpBtnLabel = str_stoptLevelUP;
		}

    	var block = "\n<div class='"+blockClass+"' id='"+idPrefix+"box'>";
		block += "<span>"+this.name+"["+this.lvl+"]</span>";
		block += "<span class='playerBtn' onclick='gameData.startJob("+this.id+",3);rebuildPlayers();'>"+jorkBtnLabel+"</span>";
		block += "<span class='playerBtn' onclick='gameData.startJob("+this.id+",2);rebuildPlayers();'>"+levelUpBtnLabel+"</span>";
    	block += "</div>"
    	return block;
    }
}
class hcmData
{
    constructor()
    {
		this.name = "NONE";
		this.money = 0;
		this.firstLoad = false;  
		this.players = new Array();  
    }

	createPlayer()
	{
		if(this.money < newPlayerCost)
		{
			alert("Недостаточно монет");
			return;
		}
		this.money -= newPlayerCost;
		this.players[this.players.length] = new player(this.players.length);
	}

    load(data)
    {
    	var ret = false;
    	do
    	{
    		log_message("load(data): "+data, false);
    		var sjson = decodeURIComponent(data);
    		//alert(sjson);
    		//alert($.base64('decode', data));
    		if(!sjson || !data)
    		{
    			log_message("null cookie, first load");
				this.firstLoad = true;
				return;
    		}
    		var obj = JSON.parse(sjson);
    		if(obj == null)
    		{
				log_message("null cookie, first load");
				this.firstLoad = true;
				return;
    		}
    		log_message("load: "+sjson, false);
    		this.setName(obj.clanName);
    		this.money = obj.money
    		if(obj.playercount > 0)
    		{
    			var len = this.players.length;
    			this.players[this.players.length] = new player(this.players.length);
	    		for(var i = 0; i < obj.playercount; i++)
	    		{
					this.players[len].name = obj.players[i].name;
					this.players[len].lvl = obj.players[i].lvl;
					this.players[len].activity = obj.players[i].activity;
					this.players[len].profession = obj.players[i].profession;
					this.players[len].id = obj.players[i].id;
	    		}

    		}
    		ret = true;
    	}
    	while(false);
    	return ret;
    }
    save()
    {
    	var obj = {};
    	obj.clanName = this.name;
    	obj.money = this.money;
    	obj.playercount = this.players.length;
    	if(this.players.length > 0)
    	{
    		var players = new Array();
    		for(var i = 0; i < this.players.length; i++)
    		{
    			var playerData = {};
				playerData.name = this.players[i].name;
				playerData.lvl = this.players[i].lvl;
				playerData.activity = this.players[i].activity;
				playerData.profession = this.players[i].profession;
				playerData.id = this.players[i].id;
				players[players.length] = playerData
    		}
    		obj.players = players;
    	}
    	var gameDataStr = JSON.stringify(obj);
    	//alert(gameDataStr);
    	log_message("save: "+gameDataStr, false);
    	var uriEnc = decodeURIComponent(gameDataStr);
    	var b64Data = $.base64('encode', gameDataStr);
    	//alert(b64Data);
    	return uriEnc;
    }
	setName(newName)
	{
		log_message("new name "+newName, false);
		this.name = newName;
		$("#clanName").html("Клан "+newName);
		$("#clanName").show();
	}

	onPlayerJobComplete(playerId, jobId)
	{

	}

	startJob(playerId, jobType)
	{
		if(!this.players[playerId])
		{
			return;
		}

		if(this.players[playerId].activity == jobType)
		{
			//already on this job. stop it
			this.players[playerId].activity = etPlayerActivites.IDLE;
		}
		else
		{
			this.players[playerId].activity = jobType;
		}
		//this.players[playerId].buildHtml();
	}
};
var gameData = new hcmData();


function onDataUpdate()
{
	$("#info_money").html(gameData.money+" мн");
	$("#info_plyerscount").html(gameData.players.length);
}

var tabInfo = null;
var tabPlayers = null;
var tabInv = null;

var cboxWelcome = null;
var cboxInfo = null;
var cboxPlayers = null;
var cboxInv = null;

function initTabs()
{
	tabInfo = $("#infoTab");
	tabPlayers = $("#playersTab");
	tabInv = $("#invTab");

	cboxWelcome = $("#welcomeScreen");
	cboxInfo = $("#clanInfoScreen");
	cboxPlayers = $("#playersScreen");
	cboxInv = $("#invScreen");

	if(tabInfo === null || tabPlayers === null || tabInv === null)
	{
		log_message("missed tab", true);
		return;
	}
	if(gameData.firstLoad === false)
	{
		log_message("show tabs", false);
		tabInfo.show();
		tabPlayers.show();
		tabInv.show();
		selectTab("clanInfoScreen","infoTab");
	}
	else
	{
		log_message("hide tabs", false);
		tabInfo.hide();
		tabPlayers.hide();
		tabInv.hide();
		cboxWelcome.hide();
		selectTab("welcomeScreen",null);
	}
	
	/*
	<div class="tab" id="infoTab">Информация</div>
	<div class="tab" id="playersTab">Состав клана</div>
	<div class="tab" id="invTab">Инвентарь</div>
	*/
}

function displayMsgBox(content)
{
	$("#popupBox").show();
	$("#popupBoxContent").html(content);
	$("#contentbox").hide();
}

function hideMsgBox()
{
	$("#popupBox").hide();
	$("#contentbox").show();
}

function rebuildPlayers()
{
	var newData = "";
	for(i = 0; i < gameData.players.length; i++)
	{
		if(!gameData.players[i])
		{
			log_message("invalid player "+i, true);
			continue;
		}
		newData += gameData.players[i].buildHtml() + "\n";
	}
	cboxPlayers.html(newData);
}

function addPlayer()
{
	gameData.createPlayer();
	rebuildPlayers();
}

function storeState()
{
	$.cookie("hcm", gameData.save(), {expires: 999});
}


function loadState()
{
	var data = $.cookie("hcm")
	log_message("found cookie "+data);
	if(false === gameData.load(data))
	{
		alert("invalid game data!");
	}
}

function selectTab(contentName, tabName)
{
	log_message("selectTab contentName:"+contentName+" tabName:"+tabName, false);
	if(contentName != null)
	{
		cboxWelcome.hide();
		cboxInfo.hide();
		cboxPlayers.hide();
		cboxInv.hide();
		$("#"+contentName).show();
	}

	if(tabName != null)
	{
		tabInfo.removeClass("activeTab");
		tabPlayers.removeClass("activeTab");
		tabInv.removeClass("activeTab");
		$("#"+tabName).addClass("activeTab");
	}
	if(gameData.firstLoad === true)
	{
		$("#headRow").height($("#title").height());
	}
	else
	{
		$("#headRow").height($("#"+tabName).height());
	}
}


function startGame()
{
	var clanName = $("#clanNameInput").val().trim();
	if(!clanName)
	{
		$("#clanNameInput").addClass("inputAlert");
		return;
	}
	//TODO: select game mode
	gameData.firstLoad = false;
	gameData.setName(clanName);
	gameData.money = 1000;
	initTabs();
	storeState();
}

function runTest()
{
	displayMsgBox("dddd");
}


$(document).ready(function()
{
	log_message("start loading", false);
	loadState();
	initTabs();
	rebuildPlayers();
	log_message("loading done", false);
	setInterval(storeState, 10000);
	setInterval(onDataUpdate, 100);
});