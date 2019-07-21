<?php	
function stringEncryption($action, $string, $secret_key){
		$output = false;

		$encrypt_method = 'AES-256-CBC';	// Default
		$secret_iv = '92!IV@_$1';	// Change the init vector!
	  
		// hash
		$key = hash('sha256', $secret_key);
	  
		// iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
		$iv = substr(hash('sha256', $secret_iv), 0, 16);
	  
		if( $action == 'encrypt' ) {
			$output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
			$output = base64_encode($output);
		}
		else if( $action == 'decrypt' ){
			$output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
		}
		return $output;
	}

$action = $argv[1];
$string = $argv[2];
$secret_key = $argv[3];

echo stringEncryption($action, $string, $secret_key);

?>
