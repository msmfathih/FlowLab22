# FlowLab automation playground

A browser-local QA training app: demo login, delayed autocomplete, order calculations, searchable/sortable/paginated tables, cancellations, uploads, CSV downloads, native dialogs, new tabs, drag/drop, asynchronous controls, and nested same-origin iframes. No real payments or backend identity service. Orders and demo session are stored in localStorage per browser origin.

## Run on Mac

Open a terminal in this folder and run:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Open http://localhost:4174/ and keep the terminal open. No npm install is needed.

## Demo login

qa@example.com / FlowLab123!

## Playwright

Set baseURL to http://localhost:4174. Visit /#orders for the checkout practice. Use the in-app Test scenarios page for acceptance criteria and locator examples. This is a static browser app, so API tests require adding a backend or mocking requests separately. Hosted private access requires the hosting account session; local hosting is suitable for unattended automation.

Reset demo data from the sidebar before each independent workflow. Same-origin nested frames live in dist/frame.html and dist/nested.html. File uploads show metadata locally; they do not transfer bytes to a server.
