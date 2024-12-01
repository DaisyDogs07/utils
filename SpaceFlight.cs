using System;
using UdonSharp;
using UnityEngine;
using VRC.SDKBase;

public class SpaceFlight : UdonSharpBehaviour {
  private VRCPlayerApi player;
  private bool isInCollider = false;
  private Vector2 movement = new Vector2(0.0f, 0.0f);
  public float speed = 5.0f;
  public float accelerationSmoothness = 0.225f;
  public float decelerationSmoothness = 0.35f;
  public float gravity = 0.001f;
  public GameObject[] col;

  void Start() {
    player = Networking.LocalPlayer;
  }

  void InputMoveVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    movement.y = value;
  }

  void InputMoveHorizontal(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    movement.x = value;
  }

  private void Update() {
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
      player.SetGravityStrength(isInCol ? Mathf.Clamp(gravity, 0.001f, 1.0f) : 1.0f);
    isInCollider = isInCol;
  }

  private void FixedUpdate() {
    if (!isInCollider)
      return;
    player.Immobilize(movement != Vector2.zero);
    float adjustedSpeed = Mathf.Clamp(speed, 0.01f, 10.0f);
    Quaternion rotation = player.GetTrackingData(VRCPlayerApi.TrackingDataType.Head).rotation;
    Vector3 currentVelocity = player.GetVelocity();
    Vector3 targetVelocity = (rotation * new Vector3(movement.x, 0.0f, movement.y)) * adjustedSpeed;
    Vector3 smoothedVelocity = Vector3.Lerp(currentVelocity, targetVelocity, (1.0f - Mathf.Clamp01(currentVelocity.magnitude >= targetVelocity.magnitude ? accelerationSmoothness : decelerationSmoothness)) * Time.fixedDeltaTime);
    player.SetVelocity(smoothedVelocity);
  }
}