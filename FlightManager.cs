// Copyright (c) 2024 DaisyDogs07
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
// associated documentation files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge, publish, distribute,
// sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or
// substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
// NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

using UdonSharp;
using UnityEngine;
using VRC.SDKBase;

public class FlightManager : UdonSharpBehaviour {
  private VRCPlayerApi player;
  private FlightManager manager;
  private Vector3 currentVelocity = Vector3.zero;
  private bool wasActive = false;
  [Header("General Settings")]
  public bool isManager = false;
  public bool allowDefaultMovement = true;
  public float speed = 5.0f;
  public float acceleration = 0.225f;
  public float deceleration = 0.35f;
  [Header("Manager Settings")]
  public float gravity = 0.0f;
  public FlightManager[] children;
  [Header("Child Settings")]
  public Vector3 force;
  public Vector3 forceRotation;

  private void Start() {
    player = Networking.LocalPlayer;
    if (isManager) {
      manager = this;
      foreach (FlightManager child in children)
        child.manager = this;
    }
  }

  private void InputMoveVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    if (isManager && allowDefaultMovement)
      force.z = value;
  }

  private void InputMoveHorizontal(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    if (isManager && allowDefaultMovement)
      force.x = value;
  }

  private void InputLookVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    if (isManager && player.IsUserInVR() && allowDefaultMovement)
      force.y = value;
  }

  private bool IsActive() {
    GameObject obj = this.gameObject;
    if (!obj.activeInHierarchy)
      return false;
    Vector3 pos = player.GetPosition();
    pos = obj.transform.InverseTransformPoint(pos);
    BoxCollider col = obj.GetComponent<BoxCollider>();
    Vector3 halfSize = col.size * 0.5f;
    Vector3 center = col.center;
    Vector3 min = center - halfSize;
    Vector3 max = center + halfSize;
    return pos.x >= min.x && pos.x <= max.x &&
      pos.y >= min.y && pos.y <= max.y &&
      pos.z >= min.z && pos.z <= max.z;
  }

  private void UpdateVelocity() {
    Vector3 currentVelocity = manager.currentVelocity;
    Vector3 movementVector = new Vector3(force.x, isManager ? 0.0f : force.y, force.z) * speed;
    Vector3 targetVelocity = movementVector;
    if (isManager) {
      targetVelocity = player.GetTrackingData(VRCPlayerApi.TrackingDataType.Head).rotation * targetVelocity;
      targetVelocity.y += force.y * speed;
      targetVelocity = Vector3.ClampMagnitude(targetVelocity, speed);
    } else {
      targetVelocity = this.gameObject.transform.rotation * targetVelocity;
      targetVelocity = Quaternion.Euler(forceRotation) * targetVelocity;
    }
    Vector3 smoothedVelocity = Vector3.LerpUnclamped(
      currentVelocity,
      targetVelocity,
      (1.0f - (
        Vector3.Dot(targetVelocity - currentVelocity, currentVelocity) > 0 &&
        Vector3.Dot(currentVelocity.normalized, targetVelocity.normalized) > 0
          ? acceleration
          : deceleration
      )) * Time.fixedDeltaTime
    );
    if (isManager)
      smoothedVelocity.y -= gravity * Time.fixedDeltaTime;
    manager.currentVelocity = smoothedVelocity;
    player.SetVelocity(smoothedVelocity);
  }

  private void Update() {
    if (!isManager || player.IsUserInVR())
      return;
    bool up = Input.GetKey(KeyCode.E) || Input.GetKey(KeyCode.Space);
    bool down = Input.GetKey(KeyCode.Q) || (Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift));
    if (up) {
      if (down)
        force.y = 0.0f;
      else force.y = 1.0f;
    } else if (down)
      force.y = -1.0f;
    else force.y = 0.0f;
  }

  private void FixedUpdate() {
    if (!isManager)
      return;
    if (!IsActive()) {
      if (wasActive) {
        player.Immobilize(false);
        player.SetGravityStrength(1.0f);
        wasActive = false;
      }
      return;
    }
    currentVelocity = player.GetVelocity();
    if (!wasActive) {
      player.SetGravityStrength(0.0f);
      wasActive = true;
    }
    bool movementAllowed = allowDefaultMovement;
    bool[] activeChildren = new bool[children.Length];
    for (int i = 0; i != children.Length; ++i) {
      FlightManager child = children[i];
      bool childActive = child.IsActive();
      activeChildren[i] = childActive;
      if (allowDefaultMovement && childActive && !child.allowDefaultMovement) {
        movementAllowed = false;
        break;
      }
    }
    if (movementAllowed) {
      player.Immobilize(force != Vector3.zero);
      UpdateVelocity();
    } else {
      if (wasActive) {
        player.Immobilize(true);
        wasActive = false;
      }
    }
    for (int i = 0; i != children.Length; ++i)
      if (activeChildren[i])
        children[i].UpdateVelocity();
  }
}