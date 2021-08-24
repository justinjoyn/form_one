import React from "react";
import {
  delete_icon,
  done_icon,
  insert_drive_file_icon,
  layers_clear_icon,
  note_add_icon,
  power_input_icon,
  refresh_icon,
  settings_icon,
  title_icon,
} from "../../assets/icons";

export default function ToolPanel() {
  return (
    <div class="tool-panel" id="tool-panel">
      <ul>
        <li>
          <button
            class="button-outline"
            id="convert-segment-button"
            title="Convert Segment"
          >
            <img src={power_input_icon} alt="Convert Segment" />
          </button>
        </li>
        <li>
          <button class="button-outline" id="type-button" title="Text">
            <img src={title_icon} alt="Text" />
          </button>
        </li>
        <li>
          <button
            class="button-outline"
            id="save-floor-button"
            title="Save Floor"
          >
            <img src={done_icon} alt="Save Floor" />
          </button>
        </li>
        <li>
          <button class="button-outline" id="add-page-button" title="Add Page">
            <img src={note_add_icon} alt="Add Page" />
          </button>
        </li>
        <li>
          <button
            class="button-outline"
            id="delete-button"
            title="Delete Selected"
          >
            <img src={delete_icon} alt="Delete Selected" />
          </button>
        </li>
        <li>
          <button
            class="button-outline"
            id="clear-canvas-button"
            title="Clear Canvas"
          >
            <img src={layers_clear_icon} alt="Clear Canvas" />
          </button>
        </li>
        <li>
          <button
            class="button-outline"
            id="reload-button"
            title="Reset"
            onclick="window.location.reload();"
          >
            <img src={refresh_icon} alt="Reset" />
          </button>
        </li>
        <li>
          <button class="button-outline" id="settings-button" title="Settings">
            <img src={settings_icon} alt="Settings" />
          </button>
        </li>
        <li>
          <button class="button-outline" id="print-button" title="Save PDF">
            <img src={insert_drive_file_icon} alt="Save PDF" />
          </button>
        </li>
      </ul>
    </div>
  );
}
