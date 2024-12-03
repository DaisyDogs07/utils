using UdonSharp;
using UnityEngine;
using VRC.SDKBase;

public class FlightController : UdonSharpBehaviour {
  private VRCPlayerApi player;
  private bool wasActive = false;
  public bool isController = true;
  public bool disableController = false;
  public Vector3 movement = new Vector3(0.0f, 0.0f, 0.0f);
  public bool isBasedOnRotation = false;
  public float speed = 5.0f;
  public float acceleration = 0.225f;
  public float deceleration = 0.35f;
  public float gravity = 0.01f;
  public GameObject[] col;
  public FlightController[] children;

  private void Start() {
    player = Networking.LocalPlayer;
  }

  private void InputMoveVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    if (isController)
      movement.z = value;
  }

  private void InputMoveHorizontal(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    if (isController)
      movement.x = value;
  }

  private void InputLookVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    if (isController && player.IsUserInVR())
      movement.y = value;
  }

  private bool IsActive() {
    Vector3 pos = player.GetPosition();
    foreach (GameObject obj in col) {
      if (!obj.activeInHierarchy)
        continue;
      Collider collider = obj.GetComponent<Collider>();
      if (collider.bounds.Contains(pos))
        return true;
    }
    return false;
  }

  private void UpdateVelocity() {
    Vector3 currentVelocity = player.GetVelocity();
    Vector3 movementVector = new Vector3(movement.x, isController ? 0.0f : movement.y, movement.z) * speed;
    Vector3 targetVelocity = isController || isBasedOnRotation
      ? player.GetTrackingData(VRCPlayerApi.TrackingDataType.Head).rotation * movementVector
      : movementVector;
    if (isController) {
      targetVelocity.y += movement.y * speed;
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
    if (isController)
      smoothedVelocity.y -= gravity * Time.fixedDeltaTime;
    player.SetVelocity(smoothedVelocity);
  }

  private void FixedUpdate() {
    if (isController) {
      bool isDisabled = false;
      foreach (FlightController child in children) {
        if (child.IsActive() && child.disableController) {
          isDisabled = true;
          break;
        }
      }
      if (isDisabled) {
        if (wasActive) {
          player.Immobilize(true);
          wasActive = false;
        }
      } else {
        if (!player.IsUserInVR()) {
          bool up = Input.GetKey(KeyCode.E) || Input.GetKey(KeyCode.Space);
          bool down = Input.GetKey(KeyCode.Q) || (Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift));
          if (up) {
            if (down)
              movement.y = 0.0f;
            else movement.y = 1.0f;
          } else if (down)
            movement.y = -1.0f;
          else movement.y = 0.0f;
        }
        if (IsActive()) {
          if (!wasActive) {
            player.SetGravityStrength(0.0f);
            wasActive = true;
          }
          player.Immobilize(movement != Vector3.zero);
          UpdateVelocity();
        } else {
          if (wasActive) {
            player.Immobilize(false);
            player.SetGravityStrength(1.0f);
            wasActive = false;
          }
        }
      }
      foreach (FlightController child in children) {
        if (child.IsActive()) {
          child.UpdateVelocity();
          if (child.disableController)
            return;
        }
      }
    }
  }
}