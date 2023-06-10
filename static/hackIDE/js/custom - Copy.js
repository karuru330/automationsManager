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
	var languageSelected = "C";
	// editor-theme
	var editorThemeSelected = "";
	// indent-spaces
	var indentSpaces = 4;

	// HackerEarth API endpoints
	var COMPILE_URL = "compile"
	var RUN_URL = "submit"

	var loggedin_user = document.getElementById("loggedin_user").value;
	//Language Boilerplate Codes
	var langBoilerplate = {}
	langBoilerplate['C'] = "#include <stdio.h>\nint main(void) {\n	// your code goes here\n	return 0;\n}\n";
	langBoilerplate['CPP'] = "#include <iostream>\nusing namespace std;\n\nint main() {\n	// your code goes here\n	return 0;\n}\n";
	langBoilerplate['CSHARP'] = "using System;\n\npublic class Test\n{\n	public static void Main()\n	{\n		// your code goes here\n	}\n}\n";
	langBoilerplate['CSS'] = "/* begin writing below */";
	langBoilerplate['CLOJURE'] = "; your code goes here";
	langBoilerplate['HASKELL'] = "main = -- your code goes here";
	langBoilerplate['JAVA'] = "class "+loggedin_user+" {\n    public static void main(String[] args) {\n        // Your code goes here\n    }\n}";
	langBoilerplate['JAVASCRIPT'] = "importPackage(java.io);\nimportPackage(java.lang);\n\n// your code goes here\n";
	langBoilerplate['OBJECTIVEC'] = "#import <objc/objc.h>\n#import <objc/Object.h>\n#import <Foundation/Foundation.h>\n\n@implementation TestObj\nint main()\n{\n	// your code goes here\n	return 0;\n}\n@end";
	langBoilerplate['PERL'] = "#!/usr/bin/perl\n# your code goes here\n";
	langBoilerplate['PHP'] = "<?php\n\n// your code goes here\n";
	langBoilerplate['PYTHON2'] = "print 'Hello World'";
	langBoilerplate['PYTHON3'] = "print('Hello World')";
	langBoilerplate['R'] = "# your code goes here";
	langBoilerplate['RUBY'] = "# your code goes here";
	langBoilerplate['RUST'] = "fn main() {\n    // The statements here will be executed when the compiled binary is called\n\n    // Print text to the console\n    println!(\"Hello World!\");\n}\n";
	langBoilerplate['SCALA'] = "object Main extends App {\n	// your code goes here\n}\n";

	// flag to block requests when a request is running
	var request_ongoing = false;

	// set base path of ace editor. Required by WhiteNoise
	ace.config.set("basePath", "/static/hackIDE/ace-builds/src/");
	// trigger extension
	ace.require("ace/ext/language_tools");
	// init the editor
	var editor = ace.edit("editor");

	// initial configuration of the editor
	//editor.setTheme("ace/theme/twilight");
	editor.session.setMode("ace/mode/c_cpp");
	editor.getSession().setTabSize(indentSpaces);
	editorContent = editor.getValue();
	editor.setFontSize(15);
	// enable autocompletion and snippets
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: true
	});
	// include boilerplate code for selected default language
	editor.setValue(langBoilerplate[languageSelected]);


	// create a simple selection status indicator
	var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
	var statusBar = new StatusBar(editor, document.getElementById("editor-statusbar"));


	checkForInitialData();

	function showResultBox() {
		$(".output-response-box").show();
		$(".run-status").show();
		$(".time-sec").show();
		$(".memory-kb").show();
		var compile_status = document.getElementById('compile_status').value;
		var run_status_status = document.getElementById('run_status_status').value;
		var run_status_time = document.getElementById('run_status_time').value;
		var run_status_memory = document.getElementById('run_status_memory').value;
		var run_status_output = document.getElementById('run_status_output').value;
		var run_status_stderr = document.getElementById('run_status_stderr').value;

		if(compile_status == "OK") {
			if(run_status_status == "AC") {
				$(".output-io").show();
				$(".output-error-box").hide();
				$(".output-io-info").show();
				$(".compile-status").children(".value").html(compile_status);
				$(".run-status").children(".value").html(run_status_status);
				$(".time-sec").children(".value").html(run_status_time);
				$(".memory-kb").children(".value").html(run_status_memory);
				$(".output-o").html(run_status_output);
			}
			else {
				$(".output-io").show();
				$(".output-io-info").hide();
				$(".output-error-box").show();
				$(".compile-status").children(".value").html(compile_status);
				$(".run-status").children(".value").html(run_status_status);
				$(".time-sec").children(".value").html(run_status_time);
				$(".memory-kb").children(".value").html(run_status_memory);
				$(".error-key").html("Run-time error (stderr)");
				$(".error-message").html(run_status_stderr);
			}
		}
		else {
			$(".output-io").show();
			$(".output-io-info").hide();
			$(".compile-status").children(".value").html("--");
			$(".run-status").children(".value").html("Compilation Error");
			$(".time-sec").children(".value").html("0.0");
			$(".memory-kb").children(".value").html("0");
			$(".error-key").html("Compile error");
			$(".error-message").html(compile_status);
		}
	}

	function checkForInitialData() {
		var code_content = document.getElementById('saved_code_content').value;
		var code_lang = document.getElementById('saved_code_lang').value;
		var code_input = document.getElementById('saved_code_input').value;
		if(code_content != "" && code_content != undefined && code_content != null) {
			languageSelected = code_lang;
			$('option:selected')[0].selected = false;
			$("option[value='"+code_lang+"']")[0].selected = true;
			editor.setValue(code_content);
			$(".output-i").html(code_input);
			$('#custom-input').val(code_input);
			showResultBox();
		}
	}

	$('#copy_code').on('mousedown', function() {
		initialVal=$('#copy_code')[0].innerHTML;
		$('#copy_link')[0].value = $('#copy_code').text();
		$('#copy_link').select();
		document.execCommand('copy');
		this.innerHTML = '<kbd>Link Copied To Clipboard</kbd>';
		$('body').on('mouseup',function(){
			$('#copy_code')[0].innerHTML = initialVal;
		});
	});

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
	 * function to download a file with given filename with text as it's contents
	 *
	 */
	function downloadFile(filename, text, lang) {

		var ext = translateLangToExt(lang);

		var zip = new JSZip()
		zip.file(filename+"."+ext, text)
		var downloaded = zip.generate({type : "blob"})

		var user_filename_choice = prompt("Enter a filename for the .zip", filename)
		user_filename_choice = user_filename_choice.replace(/\s/g, '')
		var final_filename_choice
		if (user_filename_choice == null || user_filename_choice == ""){
			final_filename_choice = "default.zip"
		} else {
			final_filename_choice = user_filename_choice + ".zip"
		}

		saveAs(downloaded, final_filename_choice)

	}

	/**
	 * function to send AJAX request to 'compile/' endpoint
	 *
	 */
	function compileCode(){

		// if a compile request is ongoing
		if(request_ongoing)
			return;

		// hide previous compile/output results
		$(".output-response-box").hide();

		// Change button text when this method is called
		//$("#compile-code").html("Compiling..");

		// disable buttons when this method is called
		$("#compile-code").prop('disabled', true);
		$("#run-code").prop('disabled', true);

		// take recent content of the editor for compiling
		updateContent();

		var csrf_token = $(":input[name='csrfmiddlewaretoken']").val();

		// if code_id present in url and updated compile URL


		var languageSelected = $("#lang").val();

		var compile_data = {
			source: editorContent,
			lang: languageSelected,
			csrfmiddlewaretoken: csrf_token
		};

		request_ongoing = true;

		$("#output").html("");

		console.log("DIlli",COMPILE_URL);
		
		

		// AJAX request to Django for compiling code
		$.ajax({
			url: COMPILE_URL,
			type: "POST",
			data: compile_data,
			dataType: "json",
			timeout: 10000,
			success: function(response){

				request_ongoing = false;

				// Change button text when this method is called
				//$("#compile-code").html("Compile it!");

				// enable button when this method is called
				$("#compile-code").prop('disabled', false);
				$("#run-code").prop('disabled', false);

				$("html, body").delay(500).animate({
					scrollTop: $('#show-results').offset().top
				}, 1000);


				if(response.message == undefined){
					if(response.compile_status == "OK"){
						$(".output-io").hide();
						$(".output-details").hide();
						$("#output").show();
						$("#output").html(response.result);

						request_ongoing = false;
					}
					else{
						
						$("#output").show();
						$("html, body").delay(500).animate({
							scrollTop: $('#output').offset().top
						}, 1000);

						$("#output").html("<br><b>Compile Error</b><br><pre>"+response.compile_status+"</pre>");

						//document.getElementById("output").scrollIntoView();
						request_ongoing = false;
					}
				}
				else{
					$(".output-io").show();
					$(".output-error-box").show();
					$(".output-io-info").hide();
					$(".compile-status").children(".value").html("--");
					$(".error-key").html("Server error");
					$(".error-message").html(response.message);
				}
			},
			error: function(error){

				request_ongoing = false;

				$(".error-key").html("Server error");
				$(".error-message").html("Server couldn't complete request. Please try again!");
			}
		});

	}

	function compileCode_with_custom_input(){

		// if a compile request is ongoing
		if(request_ongoing)
			return;

		// hide previous compile/output results
		$(".output-response-box").hide();

		// Change button text when this method is called
		//$("#compile-code").html("Compiling..");

		// disable buttons when this method is called
		$("#compile-code").prop('disabled', true);
		$("#run-code").prop('disabled', true);

		// take recent content of the editor for compiling
		updateContent();

		var csrf_token = $(":input[name='csrfmiddlewaretoken']").val();

		// if code_id present in url and updated compile URL

		var input_given = $("#custom-input").val();

		var languageSelected = $("#lang").val();

		var compile_data = {
			source: editorContent,
			lang: languageSelected,
			csrfmiddlewaretoken: csrf_token,
			input: input_given
		};

		request_ongoing = true;

		$("#output").html("");

		console.log("DIlli",COMPILE_URL);

		// AJAX request to Django for compiling code
		$.ajax({
			url: "compile_custom",
			type: "POST",
			data: compile_data,
			dataType: "json",
			timeout: 10000,
			success: function(response){

				request_ongoing = false;

				// Change button text when this method is called
				//$("#compile-code").html("Compile it!");

				// enable button when this method is called
				$("#compile-code").prop('disabled', false);
				$("#run-code").prop('disabled', false);

				$("html, body").delay(500).animate({
					scrollTop: $('#show-results').offset().top
				}, 1000);


				if(response.message == undefined){
					if(response.compile_status == "OK"){
						$(".output-io").hide();
						$(".output-details").hide();
						$("#output").show();
						$("#output").html(response.result);

						request_ongoing = false;
					}
					else{
						
						$("#output").show();
						$("html, body").delay(500).animate({
							scrollTop: $('#output').offset().top
						}, 1000);

						$("#output").html("<br><b>Compile Error</b><br><pre>"+response.compile_status+"</pre>");

						//document.getElementById("output").scrollIntoView();
						request_ongoing = false;
					}
				}
				else{
					$(".output-io").show();
					$(".output-error-box").show();
					$(".output-io-info").hide();
					$(".compile-status").children(".value").html("--");
					$(".error-key").html("Server error");
					$(".error-message").html(response.message);
				}
			},
			error: function(error){

				request_ongoing = false;

				$(".error-key").html("Server error");
				$(".error-message").html("Server couldn't complete request. Please try again!");
			}
		});

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
			lang: languageSelected,
			csrfmiddlewaretoken: csrf_token
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


	// when download-code is clicked
	$("#download-code").click(function(){

		// TODO: implement download code feature
		updateContent();

		var fileName = getFileNameByLang($("#lang").val());
		downloadFile(fileName, editorContent, $("#lang").val());

	});

	// when lang is changed
	$("#lang").change(function(){

		var csrf_token = $(":input[name='csrfmiddlewaretoken']").val();

		var languageSelected = $("#lang").val();


		var current_code = function () {
			var tmp = null;
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


	// when editor-theme is changed
	$("#editor-theme").change(function(){

		editorThemeSelected = $("#editor-theme").val();

		// update the theme for the editor
		if(editorThemeSelected == "DARK"){
			editor.setTheme("ace/theme/twilight");
		}
		else if(editorThemeSelected == "LIGHT"){
			editor.setTheme("ace/theme/dawn");
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


	// toggle custom input textarea
	$('#custom-input-checkbox').click(function () {

		$(".custom-input-container").slideToggle();

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



	// when compile-code is clicked
	$("#compile-code").click(function(){

		if($("#custom-input-checkbox").prop('checked') == true)
		{
			compileCode_with_custom_input();

		}
		else
		{
			compileCode();
		}

	});


	// when run-code is clicked
	$("#run-code").click(function(){

		runCode();

	});

	// check if input box is to be show
	if($('#custom-input').val()!="")
	{
		$('#custom-input-checkbox').click();
	}



	$("#save").click(function(){

		document.getElementById("save").innerHTML = "saving..";

		setTimeout(save, 1000);

	});

	function save(){

		updateContent();

		editorContent = editor.getValue();

		var languageSelected = $("#lang").val();
		
		var csrf_token = $(":input[name='csrfmiddlewaretoken']").val();

		var run_data = {
			code: editorContent,
			lang: languageSelected,
			csrfmiddlewaretoken: csrf_token
		};


		$.ajax({
			url: "save_current_code",
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

	var current_code = document.getElementById("current_code").value;

	var current_language = document.getElementById("current_language").value;

	
	if(current_code!="")
	{
		editor.setValue(current_code);
		languageSelected = current_language;

		document.getElementById("lang").value = languageSelected;

	}

	
	



});
