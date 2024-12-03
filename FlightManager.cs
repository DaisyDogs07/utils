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
  public float speed = 1.0f;
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
    Vector3 targetVelocity = Quaternion.Euler(forceRotation) * (this.gameObject.transform.rotation * (
        isManager
          ? player.GetTrackingData(VRCPlayerApi.TrackingDataType.Head).rotation * movementVector
          : movementVector
      ));
    if (isManager) {
      targetVelocity.y += force.y * speed;
      targetVelocity = Vector3.ClampMagnitude(targetVelocity, speed);
    }
    Vector3 smoothedVelocity = Vector3.Lerp(
      currentVelocity,
      targetVelocity,
      (1.0f - Mathf.Clamp01(
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

  private void FixedUpdate() {
    if (isManager) {
      if (IsActive()) {
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
          if (!player.IsUserInVR()) {
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
      } else {
        if (wasActive) {
          player.Immobilize(false);
          player.SetGravityStrength(1.0f);
          wasActive = false;
        }
      }
    }
  }
}