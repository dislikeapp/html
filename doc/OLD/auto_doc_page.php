<div id="docOutput"></div>
<script language="javascript">
var DOC_FILE = <?php js_doc_file(); ?>;
var CLASS_NAME = <?php js_class_name(); ?>;
var CLASS_OBJ = eval('OE.'+CLASS_NAME);
var OUT = document.getElementById("docOutput");

function autoDoc(entry, subject) {
	var doc = new AutoDoc(entry, subject);
	doc.setOutput(OUT);
	doc.setNamespace(OE, 'OE');
	doc.autoDoc();
}

if (DOC_FILE !== undefined) {
	OE.Utils.loadJSON(DOC_FILE, function(json) {
		autoDoc(json, CLASS_OBJ);
	});
}
else {
	autoDoc(undefined, CLASS_OBJ);
}
</script>