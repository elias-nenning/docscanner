#!/bin/bash
# ──────────────────────────────────────────────────────
# ScanDesk — Install Finder Quick Action
# Adds "Analyze with ScanDesk" to Finder right-click menu
# ──────────────────────────────────────────────────────

set -e

SERVICES_DIR="$HOME/Library/Services"
WORKFLOW_NAME="Analyze with ScanDesk.workflow"
WORKFLOW_PATH="$SERVICES_DIR/$WORKFLOW_NAME"
APP_URL="${SCANDESK_URL:-http://localhost:3000}"

echo "Installing ScanDesk Quick Action..."
echo "  App URL: $APP_URL"
echo ""

mkdir -p "$SERVICES_DIR"

# Remove old version if exists
if [ -d "$WORKFLOW_PATH" ]; then
  rm -rf "$WORKFLOW_PATH"
  echo "  Removed previous version."
fi

# Create workflow bundle structure
mkdir -p "$WORKFLOW_PATH/Contents"

# Info.plist — defines this as a Quick Action for files
cat > "$WORKFLOW_PATH/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>Analyze with ScanDesk</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSSendFileTypes</key>
			<array>
				<string>public.image</string>
				<string>com.adobe.pdf</string>
				<string>public.jpeg</string>
				<string>public.png</string>
				<string>public.tiff</string>
			</array>
		</dict>
	</array>
</dict>
</plist>
PLIST

# document.wflow — the actual Automator workflow
cat > "$WORKFLOW_PATH/Contents/document.wflow" << WFLOW
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AMApplicationBuild</key>
	<string>523</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>AMDocumentVersion</key>
	<string>2</string>
	<key>actions</key>
	<array>
		<dict>
			<key>action</key>
			<dict>
				<key>AMAccepts</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Optional</key>
					<false/>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.string</string>
					</array>
				</dict>
				<key>AMActionVersion</key>
				<string>2.0.3</string>
				<key>AMApplication</key>
				<array>
					<string>Automator</string>
				</array>
				<key>AMCategory</key>
				<string>AMCategoryUtilities</string>
				<key>AMIconName</key>
				<string>Run Shell Script</string>
				<key>AMKeyEquivalent</key>
				<dict/>
				<key>AMParameterProperties</key>
				<dict>
					<key>COMMAND_STRING</key>
					<dict/>
					<key>inputMethod</key>
					<dict/>
					<key>shell</key>
					<dict/>
					<key>source</key>
					<dict/>
				</dict>
				<key>AMProvides</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.string</string>
					</array>
				</dict>
				<key>AMRequiredResources</key>
				<array/>
				<key>ActionBundlePath</key>
				<string>/System/Library/Automator/Run Shell Script.action</string>
				<key>ActionName</key>
				<string>Run Shell Script</string>
				<key>ActionParameters</key>
				<dict>
					<key>COMMAND_STRING</key>
					<string>#!/bin/bash
APP_URL="$APP_URL"

for f in "\$@"; do
    MIME=\$(file --brief --mime-type "\$f")
    RESPONSE=\$(curl -s -X POST "\${APP_URL}/api/quick-upload" -F "file=@\$f;type=\$MIME" 2>/dev/null)
    TOKEN=\$(echo "\$RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "\$TOKEN" ]; then
        open "\${APP_URL}/scan/\${TOKEN}"
    else
        osascript -e "display notification \"Could not upload file. Is ScanDesk running?\" with title \"ScanDesk\""
    fi
done</string>
					<key>CheckedForUserDefaultShell</key>
					<true/>
					<key>inputMethod</key>
					<integer>1</integer>
					<key>shell</key>
					<string>/bin/bash</string>
					<key>source</key>
					<string></string>
				</dict>
				<key>BundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>CFBundleVersion</key>
				<string>2.0.3</string>
				<key>CanShowSelectedItemsWhenRun</key>
				<false/>
				<key>CanShowWhenRun</key>
				<true/>
				<key>Category</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>Class Name</key>
				<string>RunShellScriptAction</string>
				<key>InputUUID</key>
				<string>A1A1A1A1-B2B2-C3C3-D4D4-E5E5E5E5E5E5</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
					<string>Command</string>
					<string>Run</string>
				</array>
				<key>OutputUUID</key>
				<string>F6F6F6F6-A7A7-B8B8-C9C9-D0D0D0D0D0D0</string>
				<key>UUID</key>
				<string>11111111-2222-3333-4444-555555555555</string>
				<key>UnlocalizedApplications</key>
				<array>
					<string>Automator</string>
				</array>
			</dict>
		</dict>
	</array>
	<key>connectors</key>
	<dict/>
	<key>workflowMetaData</key>
	<dict>
		<key>workflowTypeIdentifier</key>
		<string>com.apple.Automator.servicesMenu</string>
	</dict>
</dict>
</plist>
WFLOW

echo "  ✓ Quick Action installed at: $WORKFLOW_PATH"
echo ""
echo "How to use:"
echo "  1. Right-click any PDF or image in Finder"
echo "  2. Go to Quick Actions → Analyze with ScanDesk"
echo "  3. The document opens in ScanDesk and scans automatically"
echo ""
echo "Note: Make sure ScanDesk is running (npm run dev) before using."
echo "If the option doesn't appear, go to System Settings → Extensions → Quick Actions"
echo "and make sure 'Analyze with ScanDesk' is enabled."
