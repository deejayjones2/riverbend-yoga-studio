"use strict";
/* Riverbend Yoga Studio — Touchstone 4. No external libraries required. */
const classes = [
  {id:"gentle",name:"Gentle Yoga",goal:"start",description:"A welcoming, slower-paced introduction to movement and breathing."},
  {id:"vinyasa",name:"Vinyasa Flow",goal:"movement",description:"Link movement and breath with options for your experience level."},
  {id:"restorative",name:"Restorative Yoga",goal:"rest",description:"Unwind through supported poses, rest, and gentle breathing."},
  {id:"athletes",name:"Yoga for Athletes",goal:"athletic",description:"Explore mobility, balance, and mindful recovery to complement an active routine."},
  {id:"private",name:"Private Sessions",goal:"personal",description:"Individual guidance tailored to your goals and comfort."}
];
const STORAGE_KEY = "riverbend-class-preferences-v1";
const FAVORITE_KEY = "riverbend-favorite-class-v1";
function getSaved(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (error) { return null; }
}
function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch (error) { return false; }
}
function getClass(id) { return classes.find(item => item.id === id); }
function showRecommendation(classInfo, level) {
  const result = document.getElementById("class-result");
  document.getElementById("result-title").textContent = `Suggested class: ${classInfo.name}`;
  document.getElementById("result-description").textContent = classInfo.description;
  document.getElementById("result-reason").textContent = level === "beginner" ? "You are new to yoga: ask your instructor about beginner-friendly modifications." : "You can discuss your goals and preferred intensity with your instructor.";
  document.getElementById("request-class").href = `events.html?interest=${encodeURIComponent(classInfo.id)}`;
  document.getElementById("save-favorite").dataset.classId = classInfo.id;
  result.hidden = false;
}
function initializeClassFinder() {
  const button = document.getElementById("find-class");
  if (!button) return;
  const goal = document.getElementById("class-goal");
  const level = document.getElementById("class-level");
  const message = document.getElementById("finder-message");
  const favoriteStatus = document.getElementById("favorite-status");
  const saved = getSaved(STORAGE_KEY);
  if (saved && typeof saved === "object") {
    if ([...goal.options].some(opt => opt.value === saved.goal)) goal.value = saved.goal;
    if ([...level.options].some(opt => opt.value === saved.level)) level.value = saved.level;
    const matching = classes.find(item => item.goal === goal.value);
    if (matching && level.value) { showRecommendation(matching,level.value); message.textContent = "Your last class choices were restored on this device."; }
  }
  const favorite = getSaved(FAVORITE_KEY);
  if (favorite && getClass(favorite)) favoriteStatus.textContent = `Your saved favorite: ${getClass(favorite).name}`;
  button.addEventListener("click", () => {
    if (!goal.value || !level.value) { message.textContent = "Choose both a goal and your experience level."; document.getElementById("class-result").hidden = true; return; }
    const match = classes.find(item => item.goal === goal.value);
    showRecommendation(match, level.value);
    message.textContent = saveData(STORAGE_KEY,{goal:goal.value,level:level.value}) ? "Your choices have been saved on this device." : "Recommendation ready. Your browser did not allow saving.";
  });
  document.getElementById("save-favorite").addEventListener("click", event => {
    const selected = getClass(event.currentTarget.dataset.classId);
    if (selected) favoriteStatus.textContent = saveData(FAVORITE_KEY,selected.id) ? `Saved favorite: ${selected.name}. It will be here when you return.` : "Your browser did not allow saving the favorite.";
  });
  document.getElementById("clear-preferences").addEventListener("click", () => {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(FAVORITE_KEY); } catch (error) { /* storage may be blocked */ }
    goal.value=""; level.value="";
    document.getElementById("class-result").hidden=true;
    message.textContent="Selections cleared."; favoriteStatus.textContent="";
  });
}
function setError(fieldId, text) {
  const field=document.getElementById(fieldId);
  const message=document.getElementById(`${fieldId}-error`);
  if (!field || !message) return;
  message.textContent=text;
  if (text) field.setAttribute("aria-invalid","true"); else field.removeAttribute("aria-invalid");
}
function validateField(fieldId) {
  const field=document.getElementById(fieldId);
  const value=field.value.trim();
  let error="";
  if (fieldId === "name") {
    if (value.length < 2) error="Enter your full name (at least 2 characters).";
  } else if (fieldId === "email") {
    if (!value) error="Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error="Enter a valid email address, such as name@example.com.";
  } else if (fieldId === "interest" || fieldId === "experience") {
    if (!value) error=`Please choose ${fieldId === "interest" ? "a class or workshop" : "your experience level"}.`;
  } else if (fieldId === "message") {
    if (value.length < 10) error="Please enter at least 10 characters in your message.";
  } else if (fieldId === "phone") {
    const wantsCall=document.getElementById("contact-phone").checked;
    if (wantsCall && !value) error="Enter a phone number if you prefer a call.";
    else if (value && !/^[0-9()+. -]{7,20}$/.test(value)) error="Enter a valid phone number (7–20 characters).";
  }
  setError(fieldId,error);
  return !error;
}
function validateContactMethod() {
  const selected=document.querySelector('input[name="contact_method"]:checked');
  document.getElementById("contact-method-error").textContent=selected ? "" : "Choose email or phone as your contact preference.";
  return Boolean(selected);
}
function initializeRequestForm() {
  const form=document.getElementById("request-form");
  if (!form) return;
  const params=new URLSearchParams(window.location.search);
  const interest=params.get("interest");
  if (classes.some(item => item.id === interest)) document.getElementById("interest").value=interest;
  const fields=["name","email","interest","experience","phone","message"];
  fields.forEach(id => {
    const field=document.getElementById(id);
    field.addEventListener(id === "interest" || id === "experience" ? "change" : "input", () => validateField(id));
  });
  document.querySelectorAll('input[name="contact_method"]').forEach(radio => radio.addEventListener("change", () => { validateContactMethod(); validateField("phone"); }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const results=fields.map(id => ({id,valid:validateField(id)}));
    const contactValid=validateContactMethod();
    const status=document.getElementById("form-status");
    if (results.every(item => item.valid) && contactValid) {
      status.textContent="Your details passed validation. This is a demonstration form; no request has been sent.";
    } else {
      status.textContent="Please correct the highlighted fields before continuing.";
      const first=results.find(item => !item.valid);
      (first ? document.getElementById(first.id) : document.getElementById("contact-email")).focus();
    }
  });
}
document.addEventListener("DOMContentLoaded", () => { initializeClassFinder(); initializeRequestForm(); });
