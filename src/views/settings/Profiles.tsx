import "./Profiles.sass";

import { Icon } from "@iconify/react";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
  createProfile,
  deleteProfile,
  duplicateProfile,
  renameProfile,
  switchProfile,
} from "../../db/action";
import { db } from "../../db/state";
import { useValue } from "../../lib/db/react";

const Profiles: React.FC = () => {
  const intl = useIntl();
  const profiles = useValue(db, "profiles");
  const activeProfileId = useValue(db, "activeProfileId");
  const [newProfileName, setNewProfileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim());
      setNewProfileName("");
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameProfile(id, editName.trim());
    }
    setEditingId(null);
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  return (
    <div className="Profiles">
      <h2>
        <FormattedMessage
          id="settings.profiles.title"
          defaultMessage="Profiles"
          description="Profiles settings section title"
        />
      </h2>

      <div className="list">
        {Object.values(profiles)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((profile) => {
            const isActive = profile.id === activeProfileId;
            const isEditing = editingId === profile.id;

            return (
              <div
                key={profile.id}
                className={`item ${isActive ? "active" : ""}`}
              >
                {isEditing ? (
                  <div className="content">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(profile.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => handleRename(profile.id)}
                    />
                  </div>
                ) : (
                  <div
                    className="content"
                    onClick={() => !isActive && switchProfile(profile.id)}
                    style={{ cursor: isActive ? "default" : "pointer" }}
                  >
                    <div className="name">{profile.name}</div>
                    {isActive && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          color: "var(--text-secondary)",
                          fontSize: "0.8em",
                        }}
                      >
                        (
                        <FormattedMessage
                          id="settings.profiles.active"
                          defaultMessage="Active"
                          description="Text indicating the active profile"
                        />
                        )
                      </span>
                    )}
                  </div>
                )}

                <div className="actions">
                  {isEditing ? (
                    <button
                      className="button--icon"
                      onClick={() => handleRename(profile.id)}
                    >
                      <Icon icon="feather:check" />
                    </button>
                  ) : (
                    <>
                      {!isActive && (
                        <button
                          className="button--icon"
                          onClick={() => switchProfile(profile.id)}
                          title={intl.formatMessage({
                            id: "settings.profiles.switch",
                            defaultMessage: "Switch",
                            description:
                              "Title for button swithcing to a profile",
                          })}
                        >
                          <Icon icon="feather:play" />
                        </button>
                      )}
                      <button
                        className="button--icon"
                        onClick={() => startEditing(profile.id, profile.name)}
                        title={intl.formatMessage({
                          id: "settings.profile.rename",
                          defaultMessage: "Rename",
                          description: "Title for button renaming a profile",
                        })}
                      >
                        <Icon icon="feather:edit-2" />
                      </button>
                      <button
                        className="button--icon"
                        onClick={() => duplicateProfile(profile.id)}
                        title={intl.formatMessage({
                          id: "settings.profile.duplicate",
                          defaultMessage: "Duplicate",
                          description: "Title for button duplicating a profile",
                        })}
                      >
                        <Icon icon="feather:copy" />
                      </button>
                      {!isActive && (
                        <button
                          className="button--icon"
                          onClick={() => deleteProfile(profile.id)}
                          title={intl.formatMessage({
                            id: "settings.profile.delete",
                            defaultMessage: "Delete",
                            description: "Title for button deleting a profile",
                          })}
                        >
                          <Icon icon="feather:trash-2" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Create New Profile */}
      {isCreating ? (
        <form onSubmit={handleCreate} className="create-form">
          <input
            type="text"
            placeholder={intl.formatMessage({
              id: "settings.profiles.namePlaceholder",
              defaultMessage: "Profile Name",
              description: "Profile name text for profile creation",
            })}
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="button button--primary">
            <FormattedMessage
              id="settings.profile.create"
              defaultMessage="Create"
              description="Button for creating a new profile"
            />
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="button--icon"
          >
            <Icon icon="feather:x" />
          </button>
        </form>
      ) : (
        <button
          className="button button--primary"
          onClick={() => setIsCreating(true)}
          style={{ marginTop: "0.5rem", width: "100%" }}
        >
          <Icon
            icon="feather:plus"
            style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
          />
          <FormattedMessage
            id="settings.profiles.new"
            defaultMessage="New Profile"
            description="Text for button for creating a new profile"
          />
        </button>
      )}
    </div>
  );
};

export default Profiles;
