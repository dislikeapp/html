<div class="vlist fullsize">

<div class="listCategory"><br /><br />LINKS</div>
<a class="listItem link" href="?">Home</a>

<div class="listCategory"><br /><br />MODULES</div>
<?php

$modules = scandirEx("data");
foreach ($modules as $mName) {
	$mPath = "data/".$mName;
	if (is_dir($mPath)) { ?>
		<div class="vlist">
			<a class="listItem module" href="?m=<?php echo $mName; ?>">
				<?php echo $mName; ?>
			</a>
		<?php
		$docs = scandirEx($mPath);
		foreach ($docs as $doc) {
			if (is_file($mPath."/".$doc)) {
				$docName = basename($doc, ".json"); ?>
				<a class="listItem doc" href="?m=<?php echo $mName; ?>&d=<?php echo $docName; ?>">
					<?php echo $docName; ?>
				</a>
			<?php }
		} ?>
		</div>
		<?php
	}
}
?>
</div>