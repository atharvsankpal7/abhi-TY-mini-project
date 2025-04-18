<?php
$file = 'https://yashrajbusinessgroup.com/download-counter.txt';

// Read the current click count
$currentCount = file_get_contents($file);

// Increment the count
$currentCount++;

// Write the new count back to the file
file_put_contents($file, $currentCount);
?>