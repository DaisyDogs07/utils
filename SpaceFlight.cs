using UdonSharp;
using UnityEngine;
using VRC.SDKBase;

public class SpaceFlight : UdonSharpBehaviour {
  private VRCPlayerApi player;
  private bool isInCollider = false;
  private Vector3 movement = new Vector3(0.0f, 0.0f, 0.0f);
  public float speed = 5.0f;
  public float acceleration = 0.225f;
  public float deceleration = 0.35f;
  public float gravity = 0.01f;
  public GameObject[] col;

  private void Start() {
    player = Networking.LocalPlayer;
  }

  private void InputMoveVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    movement.z = value;
  }

  private void InputMoveHorizontal(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    movement.x = value;
  }

  private void InputLookVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    if (player.IsUserInVR())
      movement.y = value;
  }

  private void FixedUpdate() {
    Vector3 pos = player.GetPosition();
    bool isInCol = false;
    foreach (GameObject obj in col) {
      if (!obj.activeInHierarchy)
        continue;
      Collider collider = obj.GetComponent<Collider>();
      if (collider.bounds.Contains(pos)) {
        isInCol = true;
        break;
      }
    }
    if (isInCol != isInCollider)
      player.SetGravityStrength(isInCol ? 0.0f : 1.0f);
    isInCollider = isInCol;
    if (!isInCollider)
      return;
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
    player.Immobilize(movement != Vector3.zero);
    Vector3 currentVelocity = player.GetVelocity();
    Vector3 targetVelocity = (player.GetTrackingData(VRCPlayerApi.TrackingDataType.Head).rotation * new Vector3(movement.x, 0.0f, movement.z)) * speed;
    targetVelocity.y += movement.y * speed;
    targetVelocity = Vector3.ClampMagnitude(targetVelocity, speed);
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
    smoothedVelocity.y -= gravity * Time.fixedDeltaTime;
    player.SetVelocity(smoothedVelocity);
  }
}