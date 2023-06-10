/*
* @Author: sahildua2305
* @Date:   2016-01-06 01:50:10
* @Last Modified by:   Sahil Dua
* @Last Modified time: 2016-08-13 13:13:25
*/


$(document).ready(function(){

	
	// contents of the editor at any step
	var editorContent;

	// language selected
	var languageSelected = "Python";
	// editor-theme
	var editorThemeSelected = "";
	// indent-spaces
	var indentSpaces = 4;

	// HackerEarth API endpoints
	var RUN_URL = "runcode"

	//Language Boilerplate Codes
	var langBoilerplate = {}
	
	langBoilerplate['Python'] = "print('Hello World')";
	// flag to block requests when a request is running
	var request_ongoing = false;

	// set base path of ace editor. Required by WhiteNoise
	ace.config.set("basePath", "/sta	tic/hackIDE/ace-builds/src/");
	// trigger extension
	ace.require("ace/ext/language_tools");
	// init the editor
	var editor = ace.edit("editor");

	// initial configuration of the editor
	//editor.setTheme("ace/theme/twilight");
	editor.session.setMode("ace/mode/python");
	editor.getSession().setTabSize(indentSpaces);
	editorContent = editor.getValue();
	editor.setFontSize(15);
	// enable autocompletion and snippets
	editor.setOptions({
		enableBasicAutocompletion: false,
		enableSnippets: false,
		enableLiveAutocompletion: false
	});
	// include boilerplate code for selected default language
	editor.setValue(langBoilerplate[languageSelected]);


	// create a simple selection status indicator
	var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
	var statusBar = new StatusBar(editor, document.getElementById("editor-statusbar"));

	var current_code =  $(":input[name='current_code']").val();
	console.log(current_code);
	
	if(current_code!="")
	{
		editor.setValue(current_code);

	}

	/**
	* function to get filename by language given
	*
	*/
	function getFileNameByLang(lang){
		var filename = "code";
		switch (lang) {
			case "JAVA":
				var content = editorContent;
				var re = /public\sclass\s(.*)[.\n\r]*{/;
				try {
					filename = re.exec(content)[1];
					filename = filename.replace(/(\r\n\s|\n|\r|\s)*/gm,"");
				} catch (e) {}
				break;
			default:
				break;
		}
		return filename;
	}

	/**
	 * function to update editorContent with current content of editor
	 *
	 */
	function updateContent(){
		editorContent = editor.getValue();
	}

	/**
	* function to translate the language to a file extension, txt as fallback
	*
	*/
	function translateLangToExt(ext) {
		return {
			"C":"c",
			"CPP":"cpp",
			"CSHARP":"cs",
		  "CLOJURE":"clj",
			"CSS":"css",
			"HASKELL":"hs",
			"JAVA":"java",
			"JAVASCRIPT":"js",
			"OBJECTIVEC":"m",
			"PERL":"pl",
			"PHP":"php",
			"PYTHON":"py",
			"R":"r",
			"RUBY":"rb",
			"RUST":"rs",
			"SCALA":"scala"
		}[ext] || "txt";
	}

	

	/**
	 * function to send AJAX request to 'run/' endpoint
	 *
	 */
	function runCode(){

		// if a run request is ongoing
		if(request_ongoing)
			return;

		// take recent content of the editor for compiling
		updateContent();

		var csrf_token = $(":input[name='csrfmiddlewaretoken']").val();

		// if code_id present in url and update run URL

		var input_given = $("#custom-input").val();

		request_ongoing = true;

		$("#output").html("");

		var languageSelected = $("#lang").val();

		var run_data = {
			source: editorContent,
			csrfmiddlewaretoken: csrf_token,
			input: input_given,
			lang: languageSelected

		};
		// AJAX request to Django for running code without input\
		var timeout_ms = 10000;
		$.ajax({
			url: RUN_URL,
			type: "POST",
			data: run_data,
			dataType: "json",
			timeout: timeout_ms,
			success: function(response){


				if(response.compile_status == "OK")
				{
				
					$(".output-io").hide();

					$("#output").show();
					$("html, body").delay(500).animate({
						scrollTop: $('#output').offset().top
					}, 1000);

					$("#output").html(response.result);

					//document.getElementById("output").scrollIntoView();
					request_ongoing = false;
				}
				else
				{
					$(".output-io").hide();

					$("#output").show();
					$("html, body").delay(500).animate({
						scrollTop: $('#output').offset().top
					}, 1000);

					$("#output").html("<br><b>Compile Error</b><br><pre>"+response.compile_status+"</pre>");

					//document.getElementById("output").scrollIntoView();
					request_ongoing = false;
				}

			},
			error: function(error){

				request_ongoing = false;

				$(".error-message").html("Server couldn't complete request. Please try again!");
			}
		});

	}


	// when show-settings is clicked
	$("#show-settings").click(function(event){

		event.stopPropagation();

		// toggle visibility of the pane
		$("#settings-pane").toggle();

	});


	//close settings dropdown
	$(function(){
		$(document).click(function(){
			$('#settings-pane').hide();
		});
	});

	$("#lang").change(function(){

		var csrf_token = $(":input[name='csrfmiddlewaretoken']").val();

		var languageSelected = $("#lang").val();

		console.log(languageSelected);

		var current_code = function () {
			var tmp = "";
			$.ajax({
				'async': false,
				'type': "POST",
				'global': false,
				'dataType': 'html',
				'url': "get_current_code",
				'data': { csrfmiddlewaretoken: csrf_token ,lang: languageSelected },
				'success': function (data) {
				    tmp = data;
				}
			});
			return tmp;
		}();

		// update the language (mode) for the editor
		if(languageSelected == "C" || languageSelected == "CPP"){
			editor.getSession().setMode("ace/mode/c_cpp");
		}
		else{
			editor.getSession().setMode("ace/mode/" + languageSelected.toLowerCase());
		}

		//Change the contents to the boilerplate code

		if(current_code == "")
		{
			editor.setValue(langBoilerplate[languageSelected]);
		}
		else
		{
			editor.setValue(current_code);
		}

	});
	


	//close dropdown after focus is lost
	var mouse_inside = false;
	$('#settings-pane').hover(function(){
		mouse_inside = true;
	}, function(){
		mouse_inside = false;
	});
	$('body').mouseup(function(){
		if(!mouse_inside)
			$('#settings-pane').hide();
	});

	// when indent-spaces is changed
	$("#indent-spaces").change(function(){

		indentSpaces = $("#indent-spaces").val();

		// update the indent size for the editor
		if(indentSpaces != ""){
			editor.getSession().setTabSize(indentSpaces);
		}

	});


	// to listen for a change in contents of the editor
	editor.getSession().on('change', function(e) {

		updateContent();

		// disable compile & run buttons when editor is empty
		if(editorContent != ""){
			$("#compile-code").prop('disabled', false);
			$('#compile-code').prop('title', "Press Shift+Enter");
			$("#run-code").prop('disabled', false);
			$('#run-code').prop('title', "Press Ctrl+Enter");
		}
		else{
			$("#compile-code").prop('disabled', true);
			$('#compile-code').prop('title', "Editor has no code");
			$("#run-code").prop('disabled', true);
			$('#run-code').prop('title', "Editor has no code");
		}

	});


	// assigning a new key binding for shift-enter for compiling the code
	editor.commands.addCommand({

		name: 'codeCompileCommand',
		bindKey: {win: 'Shift-Enter',  mac: 'Shift-Enter'},
		exec: function(editor) {

			updateContent();
			if(editorContent != ""){
				compileCode();
			}

		},
		readOnly: false // false if this command should not apply in readOnly mode

	});


	// assigning a new key binding for ctrl-enter for running the code
	editor.commands.addCommand({

		name: 'codeRunCommand',
		bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
		exec: function(editor) {

			updateContent();
			if(editorContent != ""){
				runCode();
			}

		},
		readOnly: false // false if this command should not apply in readOnly mode

	});

	
	// assigning a new key binding for shift-enter for compiling the code
	editor.commands.addCommand({

		name: 'saveCommand',
		bindKey: {win: 'Ctrl-S',  mac: 'Ctrl-S'},
		exec: function(editor) {

			updateContent();
			if(editorContent != ""){
				document.getElementById("save").innerHTML = "Saving..";
				setTimeout(save, 1000);
			}

		},
		readOnly: false // false if this command should not apply in readOnly mode

	});



	// when run-code is clicked
	$("#run-code").click(function(){

		runCode();

	});



	$("#save").click(function(){

		document.getElementById("save").innerHTML = "saving..";

		setTimeout(save, 1000);

	});

	function save(){

		updateContent();

		editorContent = editor.getValue();
		
		var csrf_token = $(":input[name='csrfmiddlewaretoken']").val();

		var languageSelected = $("#lang").val();
		
		var run_data = {
			code: editorContent,
			lang: languageSelected,
			csrfmiddlewaretoken: csrf_token
		};


		$.ajax({
			url: "/save_current_code",
			type: "POST",
			data: run_data,
			dataType: "json",
			timeout: 10000,
			success: function(response){
				
				//$("#output").html(response);
				
			},
			error: function(error){
				//$("#output").html(error);
			}	
		});

		document.getElementById("save").innerHTML = "Save";
	}

	// when lang is changed
	

	

});
