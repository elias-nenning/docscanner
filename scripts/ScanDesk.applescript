on open theFiles
	set appURL to "http://localhost:3000"
	
	repeat with theFile in theFiles
		set filePath to POSIX path of theFile
		set mimeType to do shell script "file --brief --mime-type " & quoted form of filePath
		
		try
			set uploadResult to do shell script "curl -s --max-time 15 -X POST " & quoted form of (appURL & "/api/quick-upload") & " -F " & quoted form of ("file=@" & filePath & ";type=" & mimeType)
			
			set tokenStart to (offset of "\"token\":\"" in uploadResult) + 9
			set tokenEnd to tokenStart
			repeat while character tokenEnd of uploadResult is not "\""
				set tokenEnd to tokenEnd + 1
			end repeat
			set theToken to text tokenStart thru (tokenEnd - 1) of uploadResult
			
			do shell script "open " & quoted form of (appURL & "/scan/" & theToken)
		on error errMsg
			display notification "Could not scan file. Is ScanDesk running on localhost:3000?" with title "ScanDesk" subtitle errMsg
		end try
	end repeat
end open
