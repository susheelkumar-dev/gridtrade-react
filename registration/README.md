# Registration

Each `*.manifest.json` here declares a module's displays and menu entries for the display registry.
Register them with:

    agentctl display register registration/*.manifest.json --app-api http://localhost:5080/api --registry http://localhost:8130
