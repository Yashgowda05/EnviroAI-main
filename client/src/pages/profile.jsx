import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaLeaf,
  FaCar,
  FaGlobe,
  FaHeart,
  FaEdit,
  FaTimes,
  FaSave,
  FaSignOutAlt,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";

import "../styles/profile.css";

const API_URL = "http://localhost:5000/api/auth";

const initialPreferences = {
  transport: "Car",
  travelStyle: "Eco-friendly",
  interests: ["Nature", "Heritage"],
  budget: "Moderate",
};

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileImage: "",
  });

  const [preferences, setPreferences] =
    useState(initialPreferences);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = response.data.user;

        const data = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          profileImage: user.profileImage || "",
        };

        setProfile(data);

        setForm({
          name: data.name,
          phone: data.phone,
          profileImage: data.profileImage,
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleEdit = () => {
    setForm({
      name: profile.name,
      phone: profile.phone,
      profileImage: profile.profileImage,
    });

    setSelectedImage(null);
    setMessage("");
    setError("");
    setEditing(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (event) => {
    const { name, value } = event.target;

    setPreferences((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleInterestChange = (interest) => {
    setPreferences((previous) => {
      const selected = previous.interests.includes(interest);

      return {
        ...previous,
        interests: selected
          ? previous.interests.filter(
              (item) => item !== interest
            )
          : [...previous.interests, interest],
      };
    });
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please select an image smaller than 2 MB.");
      return;
    }

    setError("");
    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setForm((previous) => ({
      ...previous,
      profileImage: previewUrl,
    }));
  };

  const handleCancel = () => {
    setForm({
      name: profile.name,
      phone: profile.phone,
      profileImage: profile.profileImage,
    });

    setSelectedImage(null);
    setEditing(false);
    setMessage("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (selectedImage) {
      setError(
        "Image upload requires a configured image-storage service. Use a public image URL for now."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await axios.put(
        `${API_URL}/profile`,
        {
          name: form.name.trim(),
          phone: form.phone.trim(),
          profileImage: form.profileImage.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success || !response.data.user) {
        throw new Error(
          response.data.message || "Profile update failed."
        );
      }

      const user = response.data.user;

      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      });

      setForm({
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      });

      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    // Keep this consistent with your existing authentication system.
    localStorage.removeItem("token");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading your profile...
      </div>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading">
          <div>
            <span className="profile-eyebrow">
              ENVIROAI ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal information and travel
              preferences.
            </p>
          </div>

          <div className="profile-heading-icon">
            <FaLeaf />
          </div>
        </header>

        {message && (
          <div className="profile-alert success" role="status">
            <FaCheckCircle />
            {message}
          </div>
        )}

        {error && (
          <div className="profile-alert error" role="alert">
            {error}
          </div>
        )}

        <section className="profile-hero">
          <div className="profile-avatar">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <FaUserCircle />
            )}
          </div>

          <div className="profile-hero-info">
            <span className="profile-status">
              <span className="status-dot" />
              Account Profile
            </span>

            <h2>{profile.name || "Traveler"}</h2>

            <p>
              <FaEnvelope />
              {profile.email}
            </p>
          </div>

          <button
            className="profile-primary-button"
            type="button"
            onClick={handleEdit}
          >
            <FaEdit />
            Edit Profile
          </button>
        </section>

        <div className="profile-grid">
          <section className="profile-panel">
            <div className="profile-panel-heading">
              <div className="profile-panel-icon">
                <FaUserCircle />
              </div>

              <div>
                <h3>Personal Information</h3>
                <p>Your account details</p>
              </div>
            </div>

            <div className="profile-detail">
              <span>Full Name</span>
              <strong>{profile.name || "Not provided"}</strong>
            </div>

            <div className="profile-detail">
              <span>Email Address</span>
              <strong>{profile.email || "Not provided"}</strong>
            </div>

            <div className="profile-detail">
              <span>Phone Number</span>
              <strong>{profile.phone || "Not provided"}</strong>
            </div>

            <button
              type="button"
              className="profile-secondary-button"
              onClick={handleEdit}
            >
              <FaEdit />
              Update Details
            </button>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-heading">
              <div className="profile-panel-icon">
                <FaLeaf />
              </div>

              <div>
                <h3>Travel Preferences</h3>
                <p>Customize your travel experience</p>
              </div>
            </div>

            <label className="profile-field">
              Preferred Transport
              <select
                name="transport"
                value={preferences.transport}
                onChange={handlePreferenceChange}
              >
                <option>Car</option>
                <option>Bus</option>
                <option>Train</option>
                <option>Bicycle</option>
                <option>Walking</option>
              </select>
            </label>

            <label className="profile-field">
              Travel Style
              <select
                name="travelStyle"
                value={preferences.travelStyle}
                onChange={handlePreferenceChange}
              >
                <option>Eco-friendly</option>
                <option>Adventure</option>
                <option>Cultural</option>
                <option>Relaxation</option>
                <option>Family</option>
              </select>
            </label>

            <label className="profile-field">
              Budget Preference
              <select
                name="budget"
                value={preferences.budget}
                onChange={handlePreferenceChange}
              >
                <option>Budget</option>
                <option>Moderate</option>
                <option>Premium</option>
              </select>
            </label>

            <div className="profile-interests">
              <span>Interests</span>

              <div className="profile-interest-list">
                {["Nature", "Heritage", "Food", "Adventure"].map(
                  (interest) => (
                    <button
                      type="button"
                      key={interest}
                      className={
                        preferences.interests.includes(interest)
                          ? "interest-chip selected"
                          : "interest-chip"
                      }
                      onClick={() =>
                        handleInterestChange(interest)
                      }
                    >
                      {interest}
                    </button>
                  )
                )}
              </div>
            </div>

            <p className="profile-preference-note">
              <FaGlobe />
              Preferences currently apply to this page session.
              Persistent storage can be added through your backend.
            </p>
          </section>

          <section className="profile-panel account-panel">
            <div className="profile-panel-heading">
              <div className="profile-panel-icon">
                <FaLock />
              </div>

              <div>
                <h3>Account Settings</h3>
                <p>Manage account access</p>
              </div>
            </div>

            <button
              type="button"
              className="profile-setting-row"
              onClick={() =>
                navigate("/change-password")
              }
            >
              <span>
                <FaLock />
                Change Password
              </span>

              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="profile-setting-row logout-row"
              onClick={handleLogout}
            >
              <span>
                <FaSignOutAlt />
                Log Out
              </span>

              <span aria-hidden="true">→</span>
            </button>
          </section>
        </div>
      </div>

      {editing && (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              handleCancel();
            }
          }}
        >
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="profile-modal-heading">
              <div>
                <span className="profile-eyebrow">
                  ACCOUNT SETTINGS
                </span>

                <h2 id="edit-profile-title">
                  Edit Your Profile
                </h2>
              </div>

              <button
                type="button"
                className="profile-close-button"
                onClick={handleCancel}
                disabled={saving}
                aria-label="Close editor"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="profile-image-editor">
                <div className="profile-avatar small-avatar">
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt="Profile preview"
                    />
                  ) : (
                    <FaUserCircle />
                  )}
                </div>

                <div>
                  <strong>Profile Image</strong>

                  <p>
                    Enter a public image URL below. Direct
                    uploads need an image-storage service.
                  </p>
                </div>
              </div>

              <label className="profile-field">
                Full Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </label>

              <label className="profile-field">
                Email Address
                <input
                  value={profile.email}
                  readOnly
                  disabled
                />
                <small>
                  Your registered email cannot be changed here.
                </small>
              </label>

              <label className="profile-field">
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="profile-field">
                Profile Image URL
                <input
                  name="profileImage"
                  type="url"
                  placeholder="https://example.com/profile.jpg"
                  value={form.profileImage}
                  onChange={handleChange}
                />
              </label>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={saving}
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Profile;